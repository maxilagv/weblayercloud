import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { getPanelInitialStateVariant } from '../lib/abTest';

export type DemoProfile = 'emprendedor' | 'pyme' | 'agencia';

interface DemoJourneyContextValue {
  profile: DemoProfile | null;
  setProfile: (profile: DemoProfile) => void;
  profileModalVisible: boolean;
  dismissProfileModal: () => void;
  panelOpen: boolean;
  setPanelOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  activeStepId: string | null;
  setActiveStepId: (id: string | null) => void;
  spotlightStepId: string | null;
  setSpotlightStepId: (id: string | null) => void;
  stickyDismissed: boolean;
  setStickyDismissed: (value: boolean) => void;
}

const DemoJourneyContext = createContext<DemoJourneyContextValue | null>(null);

function lsGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function lsSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // noop
  }
}

function getInitialPanelOpen(hideDemoBranding: boolean): boolean {
  if (hideDemoBranding || typeof window === 'undefined') {
    return false;
  }

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  return !isMobile && getPanelInitialStateVariant() === 'open';
}

export function DemoJourneyProvider({
  tenantId,
  hideDemoBranding,
  children,
}: {
  tenantId: string;
  hideDemoBranding: boolean;
  children: ReactNode;
}) {
  const profileKey = `lc_demo_profile_${tenantId}`;
  const profileShownKey = `lc_profile_shown_${tenantId}`;
  const stickyKey = `lc_sticky_dismissed_${tenantId}`;

  const [profile, setProfileState] = useState<DemoProfile | null>(
    () => (lsGet(profileKey) as DemoProfile | null) ?? null,
  );
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [panelOpen, setPanelOpenState] = useState(() => getInitialPanelOpen(hideDemoBranding));
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [spotlightStepId, setSpotlightStepId] = useState<string | null>(null);
  const [stickyDismissed, setStickyDismissedState] = useState(() => !!lsGet(stickyKey));

  useEffect(() => {
    if (hideDemoBranding || panelOpen) return;
    if (lsGet(profileShownKey)) return;

    const timer = window.setTimeout(() => setProfileModalVisible(true), 5_000);
    return () => window.clearTimeout(timer);
  }, [hideDemoBranding, panelOpen, profileShownKey]);

  const setProfile = useCallback(
    (nextProfile: DemoProfile) => {
      setProfileState(nextProfile);
      setProfileModalVisible(false);
      lsSet(profileKey, nextProfile);
      lsSet(profileShownKey, '1');
    },
    [profileKey, profileShownKey],
  );

  const dismissProfileModal = useCallback(() => {
    setProfileModalVisible(false);
    lsSet(profileShownKey, '1');
  }, [profileShownKey]);

  const setPanelOpen = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      setPanelOpenState(value);
    },
    [],
  );

  const setStickyDismissed = useCallback(
    (value: boolean) => {
      setStickyDismissedState(value);
      if (value) {
        lsSet(stickyKey, '1');
      }
    },
    [stickyKey],
  );

  return (
    <DemoJourneyContext.Provider
      value={{
        profile,
        setProfile,
        profileModalVisible,
        dismissProfileModal,
        panelOpen,
        setPanelOpen,
        activeStepId,
        setActiveStepId,
        spotlightStepId,
        setSpotlightStepId,
        stickyDismissed,
        setStickyDismissed,
      }}
    >
      {children}
    </DemoJourneyContext.Provider>
  );
}

export function useDemoJourney(): DemoJourneyContextValue {
  const ctx = useContext(DemoJourneyContext);
  if (!ctx) {
    throw new Error('useDemoJourney debe usarse dentro de <DemoJourneyProvider>');
  }
  return ctx;
}
