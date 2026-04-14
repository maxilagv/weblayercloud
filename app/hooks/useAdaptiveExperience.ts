import { useEffect, useState } from 'react';

interface AdaptiveExperienceState {
  prefersReducedMotion: boolean;
  prefersReducedData: boolean;
  isCoarsePointer: boolean;
  isSmallViewport: boolean;
  isLowMemoryDevice: boolean;
  isLowCpuDevice: boolean;
  allowHeavyBackgrounds: boolean;
  allowPointerEffects: boolean;
  allowSmoothScroll: boolean;
}

function getMediaMatch(query: string) {
  return typeof window !== 'undefined' ? window.matchMedia(query).matches : false;
}

function getInitialState(): AdaptiveExperienceState {
  if (typeof window === 'undefined') {
    return {
      prefersReducedMotion: false,
      prefersReducedData: false,
      isCoarsePointer: false,
      isSmallViewport: false,
      isLowMemoryDevice: false,
      isLowCpuDevice: false,
      allowHeavyBackgrounds: true,
      allowPointerEffects: true,
      allowSmoothScroll: true,
    };
  }

  const browserNavigator = navigator as Navigator & {
    connection?: {
      saveData?: boolean;
      effectiveType?: string;
    };
    deviceMemory?: number;
  };
  const connection = browserNavigator.connection;
  const deviceMemory = typeof browserNavigator.deviceMemory === 'number' ? browserNavigator.deviceMemory : 8;
  const hardwareConcurrency =
    typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : 8;
  const prefersReducedMotion = getMediaMatch('(prefers-reduced-motion: reduce)');
  const isCoarsePointer = getMediaMatch('(pointer: coarse)');
  const isSmallViewport = getMediaMatch('(max-width: 960px)');
  const prefersReducedData =
    Boolean(connection?.saveData) || /(^|-)2g$/i.test(connection?.effectiveType || '');
  const isLowMemoryDevice = deviceMemory <= 4;
  const isLowCpuDevice = hardwareConcurrency <= 4;
  const shouldReduceMotion =
    prefersReducedMotion || prefersReducedData || isLowMemoryDevice || isLowCpuDevice;

  return {
    prefersReducedMotion,
    prefersReducedData,
    isCoarsePointer,
    isSmallViewport,
    isLowMemoryDevice,
    isLowCpuDevice,
    allowHeavyBackgrounds: !shouldReduceMotion && !isSmallViewport && !isCoarsePointer,
    allowPointerEffects: !shouldReduceMotion && !isCoarsePointer && !isSmallViewport,
    allowSmoothScroll: !prefersReducedMotion && !prefersReducedData,
  };
}

export function useAdaptiveExperience() {
  const [state, setState] = useState<AdaptiveExperienceState>(() => getInitialState());

  useEffect(() => {
    const updateState = () => {
      setState(getInitialState());
    };

    const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarsePointerMedia = window.matchMedia('(pointer: coarse)');
    const smallViewportMedia = window.matchMedia('(max-width: 960px)');

    reducedMotionMedia.addEventListener('change', updateState);
    coarsePointerMedia.addEventListener('change', updateState);
    smallViewportMedia.addEventListener('change', updateState);
    window.addEventListener('resize', updateState);

    return () => {
      reducedMotionMedia.removeEventListener('change', updateState);
      coarsePointerMedia.removeEventListener('change', updateState);
      smallViewportMedia.removeEventListener('change', updateState);
      window.removeEventListener('resize', updateState);
    };
  }, []);

  return state;
}
