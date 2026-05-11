import * as React from "react"

const MOBILE_BREAKPOINT = 768; // Breakpoint pixel width to determine mobile layout

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined); // Track mobile viewport state

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`); // Create media query listener for mobile breakpoint
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT); // Update state when viewport width changes
    };
    mql.addEventListener("change", onChange); // Listen for media query changes
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT); // Set initial mobile state on mount
    return () => mql.removeEventListener("change", onChange); // Clean up event listener on unmount
  }, []);

  return !!isMobile; // Return boolean indicating if viewport is mobile size
} // Hook to detect if the current viewport width is below the mobile breakpoint
