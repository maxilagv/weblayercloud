import { useEffect } from 'react';
import { trackBehaviorEvent, trackVisit } from '../lib/tracking';

const SCROLL_DEPTH_MILESTONES = [25, 50, 75, 90];
const TIME_BUCKETS = [15, 45, 90];

export function useVisitorTracking(path: string) {
  useEffect(() => {
    const sentScrollDepths = new Set<number>();
    const seenSections = new Set<string>();
    const timers: number[] = [];

    void trackVisit(path).catch((error) => {
      console.warn('[LayerCloud] Visitor tracking error:', error);
    });

    const handleScroll = () => {
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollTop = window.scrollY;
      const depth = documentHeight > 0 ? Math.round((scrollTop / documentHeight) * 100) : 100;

      SCROLL_DEPTH_MILESTONES.forEach((milestone) => {
        if (depth >= milestone && !sentScrollDepths.has(milestone)) {
          sentScrollDepths.add(milestone);
          void trackBehaviorEvent({
            eventName: 'scroll_depth',
            path,
            payload: { depth: milestone },
          }).catch(() => undefined);
        }
      });
    };

    const handleClick = (event: MouseEvent) => {
      const element = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-track-event]');
      if (!element) {
        return;
      }

      const eventName = element.dataset.trackEvent;
      if (!eventName) {
        return;
      }

      const href =
        element instanceof HTMLAnchorElement
          ? element.href
          : element.getAttribute('href') || element.dataset.trackHref || '';

      void trackBehaviorEvent({
        eventName,
        path,
        payload: {
          label: element.dataset.trackLabel || element.textContent?.trim() || '',
          location: element.dataset.trackLocation || '',
          href,
        },
      }).catch(() => undefined);
    };

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const element = entry.target as HTMLElement;
          const sectionName = element.dataset.trackSection || element.id || '';
          if (!sectionName || seenSections.has(sectionName)) {
            return;
          }

          seenSections.add(sectionName);
          void trackBehaviorEvent({
            eventName: 'section_view',
            path,
            payload: { section: sectionName },
          }).catch(() => undefined);
        });
      },
      {
        threshold: 0.45,
      },
    );

    document.querySelectorAll<HTMLElement>('[data-track-section]').forEach((element) => {
      sectionObserver.observe(element);
    });

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('click', handleClick);

    TIME_BUCKETS.forEach((seconds) => {
      const timer = window.setTimeout(() => {
        void trackBehaviorEvent({
          eventName: 'time_on_page_bucket',
          path,
          payload: { bucket: `${seconds}s`, seconds },
        }).catch(() => undefined);
      }, seconds * 1000);

      timers.push(timer);
    });

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClick);
      sectionObserver.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [path]);
}
