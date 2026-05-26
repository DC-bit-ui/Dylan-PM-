// Port of v2-exemplar.js classifyAction — maps a "next step" copy line into
// an action-type chip so reps can read what kind of action is wanted at a glance.

export type WorkActionType =
  | 'deliver'
  | 'partner'
  | 'call'
  | 'meeting'
  | 'email'
  | 'review'
  | 'default';

export interface WorkActionClassification {
  type: WorkActionType;
  icon: string;
  label: string;
}

const PATTERNS: Array<{
  re: RegExp;
  type: WorkActionType;
  icon: string;
  label: string;
}> = [
  { re: /\bhorizon\b|send (the )?report|share (the )?report|hand[- ]over|deliver/i, type: 'deliver', icon: '📤', label: 'Deliver' },
  { re: /lawrieco|via partner|prompt (the )?broker|nudge (the )?broker|broker follow[- ]?up/i, type: 'partner', icon: '🤝', label: 'Via partner' },
  { re: /\b(call|phone|dial|ring|aircall)\b/i, type: 'call', icon: '📞', label: 'Call' },
  { re: /\b(visit|farm visit|book a visit|schedule a visit|on[- ]site|meet on)\b/i, type: 'meeting', icon: '🚜', label: 'Visit / meet' },
  { re: /\b(email|reply|draft|write to|message|follow[- ]?up|send)\b/i, type: 'email', icon: '✉️', label: 'Email' },
  { re: /\b(check|verify|review|read|investigate|confirm)\b/i, type: 'review', icon: '🔍', label: 'Review' },
];

export function classifyAction(text?: string): WorkActionClassification {
  if (!text) return { type: 'default', icon: '→', label: 'Do this' };
  for (const p of PATTERNS) {
    if (p.re.test(text)) return { type: p.type, icon: p.icon, label: p.label };
  }
  return { type: 'default', icon: '→', label: 'Do this' };
}

export function heatTone(heat?: string): 'red' | 'orange' | 'blue' | 'gray' {
  switch ((heat || '').toUpperCase()) {
    case 'HOT':
      return 'red';
    case 'WARM':
      return 'orange';
    case 'COLD':
      return 'blue';
    default:
      return 'gray';
  }
}

export function heatIcon(heat?: string): string {
  switch ((heat || '').toUpperCase()) {
    case 'HOT':
      return '🔥';
    case 'WARM':
      return '🟡';
    case 'COLD':
      return '❄️';
    default:
      return '•';
  }
}
