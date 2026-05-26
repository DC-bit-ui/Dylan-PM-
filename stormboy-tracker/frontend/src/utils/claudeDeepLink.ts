// Claude Desktop deep-link launcher. Same mechanism as v2: build a
// claude:// URL with the prompt URL-encoded, fire via hidden iframe so
// the dashboard page doesn't navigate away.
//
// Confirmed protocol handler by inspecting Claude Desktop's AppX
// bundle (Claude_pzs8sxrjxfjjc package, registered protocol 'claude').
// 2026-05-18.

const CLAUDE_DESKTOP_URL_LIMIT = 7000;

export interface DeepLinkResult {
  opened: boolean;
  reason?: 'prompt-too-long';
  url_length?: number;
}

export function openClaudeDesktop(prompt: string): DeepLinkResult {
  const url = 'claude://cowork/new?q=' + encodeURIComponent(prompt);
  if (url.length > CLAUDE_DESKTOP_URL_LIMIT) {
    return { opened: false, reason: 'prompt-too-long' };
  }
  let frame = document.getElementById(
    'v3-claude-launcher-frame',
  ) as HTMLIFrameElement | null;
  if (!frame) {
    frame = document.createElement('iframe');
    frame.id = 'v3-claude-launcher-frame';
    frame.style.display = 'none';
    document.body.appendChild(frame);
  }
  frame.src = url;
  return { opened: true, url_length: url.length };
}

export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback path for older browsers
  return new Promise((resolve, reject) => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      resolve();
    } catch (e) {
      reject(e instanceof Error ? e : new Error(String(e)));
    }
  });
}
