# PandaDoc Template UUID Request — Draft to Kieren

**Date:** 2026-05-25
**From:** Dylan
**To:** Kieren (primary) — Will can substitute if Will has template-edit access
**Status:** Follow-up to the 2026-05-21 PandaDoc access request. Sandbox API key was supplied. Templates linked were form share-links not template URLs (different ID system). This message requests the correct UUIDs.
**Related:** `memory/deliverables/2026-05-21-pandadoc-access-request-kieren.md` (original request)

---

## Why this is a follow-up

Kieren supplied three URLs in his initial reply:
- KCT → `form.pandadoc.com/form/qfwte8iPDxnh4ijX9iMRcQ` (this is a public form share link, not a template UUID)
- LawrieCo → `form.pandadoc.com/form/XTBQ6DdQAVsGTdnxkN9KXg` (same — public form share)
- EIH-C → `app.pandadoc.com/a/#/templates/7ZTfTgUbQgZc9MdBpLRDT8` ✓ (this is the correct format — UUID `7ZTfTgUbQgZc9MdBpLRDT8`)

The tool's API call (`POST /public/v1/documents` with `template_uuid`) requires the **template UUID** (inside-editor URL), not the form share-link ID. They look similar but use different ID spaces; the share-link won't resolve as a template_uuid.

## Plain-text message (copy-paste ready)

```
Hi Kieren,

Thanks for the sandbox API key — that's in. There are three more values I need from you to wire the live PandaDoc integration into the EIH automation tool. Each one is a unique ID for one of our templates, and each one takes about 30 seconds to grab.

The IDs I need are for these three templates. The links below are the ones that were sent over previously — they'll help you pick the right template in PandaDoc for each ID:

1. KCT (the Key Commercial Terms template AgriProve uses for our own projects)
   Reference: https://form.pandadoc.com/form/qfwte8iPDxnh4ijX9iMRcQ

2. LawrieCo KCT (the template we use when registering a LawrieCo-tagged project)
   Reference: https://form.pandadoc.com/form/XTBQ6DdQAVsGTdnxkN9KXg

3. EIH-C (the consent form for mortgagees, easement holders, caveators, and Crown)
   Reference: https://app.pandadoc.com/a/#/templates/7ZTfTgUbQgZc9MdBpLRDT8

The reference links above are the public "share-link" version of each template — useful for identifying which template I mean, but NOT the ID format the tool can use. I need the template's own URL from inside the editor.

To grab the right ID for each one:

1. Log into PandaDoc (app.pandadoc.com). Make sure you're in the same workspace
   you generated the sandbox API key for — if you're in a different workspace
   the IDs won't match and the tool can't see them.

2. Click "Templates" in the left-hand menu.

3. Click into the template that matches the reference link above (e.g. for #1,
   open the template that the form.pandadoc.com/form/qfwte8iPDxnh4ijX9iMRcQ
   link points at).

4. Once you're inside the template editor, look at the URL in your browser's
   address bar. It will look something like this:

       https://app.pandadoc.com/a/#/templates/7ZTfTgUbQgZc9MdBpLRDT8

   The 22-character string at the very end (the bit after /templates/) is the
   ID I need. For the EIH-C one (#3) the ID is already in that format —
   7ZTfTgUbQgZc9MdBpLRDT8 — but please double-check it opens in the same
   workspace as the sandbox API key so we know it's the right copy.

5. Reply with all three labelled like this:

       KCT:        <id>
       LawrieCo:   <id>
       EIH-C:      <id>

Important — please DO NOT send me the "Share" link (the form.pandadoc.com/form/
URLs above). Those are different IDs used for public form-filling and the
tool can't use them. We need the URL from inside the template editor itself.

If any of these templates don't exist in the sandbox workspace yet, let me
know — most likely the EIH-C consent form (which is new and may need LawrieCo
legal input to draft first).

Thanks,
Dylan
```

## Will as an alternative

If Kieren is unavailable, Will can supply the same UUIDs **provided he has template-editor access in the same workspace as the sandbox API key**. If Will sees the templates in `app.pandadoc.com → Templates` and can click into them, his URL bar will show the template UUID and he can send the same three values.

If Will only has document-creator access (not template-editor), he won't see the template URLs and can't help — escalate back to Kieren.

## What lands when this arrives

`web/.env.local`:
```
PANDADOC_API_KEY=<sandbox key already in place>
PANDADOC_KCT_TEMPLATE_ID=<KCT UUID>
PANDADOC_KCT_TEMPLATE_ID_LAWRIECO=<LawrieCo UUID>
PANDADOC_EIH_CONSENT_TEMPLATE_ID=7ZTfTgUbQgZc9MdBpLRDT8
```

No code change at flip time — `getPandadocClient()` and the create routes pick up the env vars automatically. Restart of the Next.js dev server required to take effect (server-side env vars don't hot-reload).
