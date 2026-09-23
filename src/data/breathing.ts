export type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'holdAfter';

export interface BreathingMethod {
  id: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdAfter: number;
  defaultDurationMinutes: number;
  isPrimary: boolean;
  color: string;
}

export const BREATHING_METHODS: BreathingMethod[] = [
  { id: 'sleep_478', inhale: 4, hold: 7, exhale: 8, holdAfter: 0, defaultDurationMinutes: 10, isPrimary: true, color: '#5C6BC0' },
  { id: 'box_4444', inhale: 4, hold: 4, exhale: 4, holdAfter: 4, defaultDurationMinutes: 5, isPrimary: false, color: '#26A69A' },
  { id: 'belly_46', inhale: 4, hold: 0, exhale: 6, holdAfter: 0, defaultDurationMinutes: 5, isPrimary: false, color: '#66BB6A' },
  { id: 'stress_426', inhale: 4, hold: 2, exhale: 6, holdAfter: 0, defaultDurationMinutes: 5, isPrimary: false, color: '#FF8A65' },
];

export const DURATION_PRESETS = [2, 5, 8, 10, 15, 20];
export const MAX_CUSTOM_DURATION = 60;

export const getBreathingMethod = (id: string) => BREATHING_METHODS.find((m) => m.id === id);

export const methodPhases = (m: BreathingMethod): { phase: BreathPhase; seconds: number }[] =>
  (
    [
      { phase: 'inhale', seconds: m.inhale },
      { phase: 'hold', seconds: m.hold },
      { phase: 'exhale', seconds: m.exhale },
      { phase: 'holdAfter', seconds: m.holdAfter },
    ] as const
  ).filter((p) => p.seconds > 0);
