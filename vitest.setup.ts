import '@testing-library/react'; // ensure types or DOM logic

// jsdom has no matchMedia; give SSR-safe hooks (useMediaQuery /
// useViewportTier) a deterministic never-matching stub so components mount.
// Container-query behaviour is asserted in Playwright, never here (§10).
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string): MediaQueryList => {
    const mql: MediaQueryList = {
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined, // legacy API, some libs still probe it
      removeListener: () => undefined,
      dispatchEvent: () => false,
    };
    return mql;
  };
}
