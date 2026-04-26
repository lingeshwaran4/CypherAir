export const PROFILES = {
  healthy_adult: {
    label: 'Healthy Adult',
    icon: 'person',
    alertThreshold: 201,
    warningThreshold: 101,
    color: '#1976D2',
  },
  elderly: {
    label: 'Elderly (65+)',
    icon: 'accessibility',
    alertThreshold: 101,
    warningThreshold: 51,
    color: '#7B1FA2',
  },
  asthmatic: {
    label: 'Asthmatic',
    icon: 'fitness',
    alertThreshold: 81,
    warningThreshold: 51,
    color: '#E53935',
  },
  child: {
    label: 'Child (under 12)',
    icon: 'happy',
    alertThreshold: 81,
    warningThreshold: 51,
    color: '#F57C00',
  },
} as const;

export type ProfileKey = keyof typeof PROFILES;
