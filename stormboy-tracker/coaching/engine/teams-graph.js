/**
 * Microsoft Graph integration for the Operation Stormboy Teams channel.
 *
 * Pulls recent messages from the configured channel and surfaces matches
 * where a Stormboy contact's name appears alongside snapshot keywords.
 * Provides the third signal source for snapshot-state.js (alongside
 * HubSpot emails and HubSpot tickets).
 *
 * AUTH: client-credentials (app-only) flow.
 *   POST https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token
 *   grant_type=client_credentials, scope=https://graph.microsoft.com/.default
 *
 * REQUIRED ENV VARS:
 *   MS_GRAPH_TENANT_ID
 *   MS_GRAPH_CLIENT_ID
 *   MS_GRAPH_CLIENT_SECRET
 *
 * REQUIRED AZURE AD APP PERMISSIONS (Application, not Delegated):
 *   ChannelMessage.Read.All        — read channel messages org-wide
 *   Team.ReadBasic.All             — find the Operation Stormboy team
 *   Channel.ReadBasic.All          — find the Deals channel
 *
 * Admin consent is required for ChannelMessage.Read.All — this is a
 * "protected" application permission. The org admin grants once in
 * Azure portal → App registration → API permissions → Grant admin
 * consent.
 *
 * OPTIONAL ENV VARS:
 *   MS_GRAPH_TEAM_NAME       — override team-name match (default: "Operation Stormboy")
 *   MS_GRAPH_CHANNEL_NAME    — override channel-name match (default: "Deals")
 *   MS_GRAPH_TEAM_ID         — skip discovery if known
 *   MS_GRAPH_CHANNEL_ID      — skip discovery if known
 *
 * CACHING:
 *   - Access token cached in-memory for token's lifetime (≈3600s)
 *   - Channel-message snapshot cached for 5 minutes per process
 *   - Team/channel IDs cached forever once discovered
 *
 * GRACEFUL DEGRADATION:
 *   isConfigured() returns false when env vars are missing — callers
 *   should check this before invoking findContactMentions.
 *   Any Graph API error (auth, rate, transient) returns empty mention
 *   maps + logs to console; never throws to the caller.
 */

const TENANT = () => process.env.MS_GRAPH_TENANT_ID;
const CLIENT_ID = () => process.env.MS_GRAPH_CLIENT_ID;
const CLIENT_SECRET = () => process.env.MS_GRAPH_CLIENT_SECRET;
const TEAM_NAME = () => process.env.MS_GRAPH_TEAM_NAME || 'Operation Stormboy';
const CHANNEL_NAME = () => process.env.MS_GRAPH_CHANNEL_NAME || 'Deals';

const MSG_CACHE_TTL_MS = 5 * 60 * 1000;
const TOKEN_REFRESH_BUFFER_MS = 60 * 1000;

let _tokenCache = null;   // { token: string, expires_at: ms }
let _teamId = null;
let _channelId = null;
let _msgCache = null;     // { fetched_at: ms, messages: [...] }

function isConfigured() {
  return !!(TENANT() && CLIENT_ID() && CLIENT_SECRET());
}

async function getAccessToken() {
  if (_tokenCache && Date.now() < _tokenCache.expires_at - TOKEN_REFRESH_BUFFER_MS) {
    return _tokenCache.token;
  }
  const url = `https://login.microsoftonline.com/${TENANT()}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID(),
    client_secret: CLIENT_SECRET(),
    scope: 'https://graph.microsoft.com/.default',
  });
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MS Graph token request failed ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  _tokenCache = {
    token: data.access_token,
    expires_at: Date.now() + (data.expires_in * 1000),
  };
  return _tokenCache.token;
}

async function graphGet(urlPath) {
  const token = await getAccessToken();
  const res = await fetch('https://graph.microsoft.com/v1.0' + urlPath, {
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MS Graph ${urlPath} → ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

async function discoverTeamAndChannel() {
  if (_teamId && _channelId) return;
  if (process.env.MS_GRAPH_TEAM_ID && process.env.MS_GRAPH_CHANNEL_ID) {
    _teamId = process.env.MS_GRAPH_TEAM_ID;
    _channelId = process.env.MS_GRAPH_CHANNEL_ID;
    return;
  }
  // Find the team by displayName (case-insensitive contains)
  const teamsList = await graphGet(`/groups?$filter=resourceProvisioningOptions/Any(x:x eq 'Team')&$select=id,displayName&$top=200`);
  const team = (teamsList.value || []).find(t =>
    (t.displayName || '').toLowerCase().includes(TEAM_NAME().toLowerCase())
  );
  if (!team) throw new Error(`Team "${TEAM_NAME()}" not found in tenant`);
  _teamId = team.id;
  // Find the channel by displayName
  const channelsList = await graphGet(`/teams/${_teamId}/channels?$select=id,displayName`);
  const channel = (channelsList.value || []).find(c =>
    (c.displayName || '').toLowerCase().includes(CHANNEL_NAME().toLowerCase())
  );
  if (!channel) throw new Error(`Channel "${CHANNEL_NAME()}" not found in team "${TEAM_NAME()}"`);
  _channelId = channel.id;
  console.log(`[teams-graph] discovered team "${team.displayName}" (${_teamId}) > channel "${channel.displayName}" (${_channelId})`);
}

// Pull recent channel messages (and 1 level of replies for each).
// Caches the flattened message list for 5 minutes.
async function fetchRecentMessages() {
  if (_msgCache && Date.now() - _msgCache.fetched_at < MSG_CACHE_TTL_MS) {
    return _msgCache.messages;
  }
  await discoverTeamAndChannel();
  // Up to 200 top-level messages; Graph default page size is 50.
  // For each top-level, fetch replies in a second pass to keep latency
  // manageable. Order is "lastModifiedDateTime desc" by default.
  const top = await graphGet(`/teams/${_teamId}/channels/${_channelId}/messages?$top=50`);
  const messages = [];
  for (const m of (top.value || [])) {
    messages.push(normalizeMessage(m, _channelId, false));
    if ((m.replyCount || 0) > 0) {
      try {
        const replies = await graphGet(`/teams/${_teamId}/channels/${_channelId}/messages/${m.id}/replies`);
        for (const r of (replies.value || [])) {
          messages.push(normalizeMessage(r, _channelId, true, m.id));
        }
      } catch (e) {
        console.warn('[teams-graph] reply fetch failed for', m.id, e.message);
      }
    }
  }
  _msgCache = { fetched_at: Date.now(), messages };
  return messages;
}

function stripHtml(s) {
  if (!s) return '';
  return s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

function normalizeMessage(m, channelId, isReply, parentId) {
  const content = (m.body && m.body.content) || '';
  return {
    id: m.id,
    is_reply: isReply,
    parent_id: parentId || null,
    channel_id: channelId,
    posted_at: m.createdDateTime,
    posted_by: m.from && m.from.user ? m.from.user.displayName : '(unknown)',
    text: stripHtml(content),
    subject: m.subject || null,
  };
}

// Build a deterministic match key for a contact — try several name shapes
// (firstname surname, "surname firstname", "FirstnameOnly", farm name if
// captured). Keeps it conservative to avoid false positives.
function namesForContact(contact) {
  const p = contact.properties || {};
  const fn = (p.firstname || '').trim();
  const ln = (p.lastname || '').trim();
  const names = new Set();
  if (fn && ln) names.add(`${fn} ${ln}`);
  if (fn && ln) names.add(`${ln}, ${fn}`);
  // Single-name matches only if both parts are at least 4 chars
  if (fn.length >= 4) names.add(fn);
  if (ln.length >= 4) names.add(ln);
  return Array.from(names);
}

// For each contact, find channel messages where the contact's name
// AND one of the keywords appear in the same message (or its replies).
// Returns { contactId: { mentions: [...] } } — only includes contacts
// that had any matches.
async function findContactMentions(contacts, { keywords = ['snapshot', 'horizon'] } = {}) {
  const out = {};
  if (!contacts || !contacts.length) return out;
  if (!isConfigured()) return out;
  let messages;
  try {
    messages = await fetchRecentMessages();
  } catch (e) {
    console.warn('[teams-graph] message fetch failed:', e.message);
    return out;
  }
  const lcKeywords = keywords.map(k => k.toLowerCase());
  for (const c of contacts) {
    const names = namesForContact(c);
    if (!names.length) continue;
    const matches = [];
    for (const m of messages) {
      const haystack = (m.text || '').toLowerCase();
      if (!haystack) continue;
      const nameHit = names.some(n => haystack.includes(n.toLowerCase()));
      if (!nameHit) continue;
      const kwHit = lcKeywords.some(k => haystack.includes(k));
      if (!kwHit) continue;
      matches.push({
        message_id: m.id,
        posted_at: m.posted_at,
        posted_by: m.posted_by,
        snippet: m.text.slice(0, 140) + (m.text.length > 140 ? '…' : ''),
        is_reply: m.is_reply,
      });
    }
    if (matches.length) {
      matches.sort((a, b) => Date.parse(b.posted_at) - Date.parse(a.posted_at));
      out[c.id] = { mentions: matches };
    }
  }
  return out;
}

// Lightweight probe — used by config-health endpoint to surface state
// without performing the heavy message pull.
async function probe() {
  if (!isConfigured()) return { configured: false, reason: 'MS_GRAPH_* env vars not set' };
  try {
    await getAccessToken();
  } catch (e) {
    return { configured: true, auth_ok: false, error: e.message };
  }
  try {
    await discoverTeamAndChannel();
  } catch (e) {
    return { configured: true, auth_ok: true, discovery_ok: false, error: e.message };
  }
  return {
    configured: true, auth_ok: true, discovery_ok: true,
    team_id: _teamId, channel_id: _channelId,
  };
}

module.exports = { isConfigured, findContactMentions, probe };
