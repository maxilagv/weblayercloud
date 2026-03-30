const STORAGE_PREFIX = 'lc_ab_';

export interface DemoJourneyABContext {
  ab_demo_bar_cta: string;
  ab_panel_initial_state: string;
  ab_sticky_delay: string;
}

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // noop
  }
}

export function getABVariant(testId: string, variants: readonly string[]): string {
  if (variants.length === 0) {
    throw new Error(`AB test "${testId}" must define at least one variant.`);
  }

  if (typeof window === 'undefined') {
    return variants[0];
  }

  const key = `${STORAGE_PREFIX}${testId}`;
  const stored = readStorage(key);
  if (stored && variants.includes(stored)) {
    return stored;
  }

  const picked = variants[Math.floor(Math.random() * variants.length)] ?? variants[0];
  writeStorage(key, picked);
  return picked;
}

export function getDemoBarVariant(): string {
  return getABVariant('demo_bar_cta', ['crear-mi-tienda', 'probar-7-dias']);
}

export function getPanelInitialStateVariant(): string {
  return getABVariant('panel_initial_state', ['closed', 'open']);
}

export function getStickyDelayVariant(): string {
  return getABVariant('sticky_delay', ['15s', '30s', '60s']);
}

export function getStickyDelayMs(): number {
  const variant = getStickyDelayVariant();
  if (variant === '15s') return 15_000;
  if (variant === '60s') return 60_000;
  return 30_000;
}

export function getDemoJourneyABContext(): DemoJourneyABContext {
  return {
    ab_demo_bar_cta: getDemoBarVariant(),
    ab_panel_initial_state: getPanelInitialStateVariant(),
    ab_sticky_delay: getStickyDelayVariant(),
  };
}
