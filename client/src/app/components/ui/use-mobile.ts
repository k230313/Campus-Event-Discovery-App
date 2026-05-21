// ============================================
// File:    use-mobile.ts
// Author:  Navroop Kaur
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Renders the use mobile frontend component.
// ============================================

import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Executes the use is mobile logic.
 * @returns {*} Returns the resulting value.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    /**
     * Asynchronously executes the on change logic.
     * @returns {*} Returns the resulting value.
     */
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
