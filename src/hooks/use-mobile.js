import * as React from "react"

const _MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(undefined)

  React.useEffect(() => {
    const _mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const _onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange);
  }, [] // TODO: Add missing dependencies to fix exhaustive-deps warning)

  return !!isMobile
}
