import { useEffect } from 'react'

export function useExternalLinkHandler() {
    useEffect(() => {
        const handleLinkClick = (e: MouseEvent) => {
            const target = (e.target as HTMLElement).closest('a')
            if (!target) return

            const href = target.getAttribute('href')
            if (!href) return

            // Check if it's an external link (http/https) and NOT local
            // We assume local links might be relative or start with /
            // But also check protocol to be sure
            const isExternal = href.startsWith('http') && !href.includes(window.location.hostname)

            if (isExternal) {
                e.preventDefault()

                // "System" browser handling for WebView wrappers (Cordova, Capacitor, etc)
                // or just secure new tab for web
                // _system is a convention for some webviews to escape the container
                window.open(href, '_system', 'noopener,noreferrer')
            }
        }

        document.addEventListener('click', handleLinkClick, true) // Capture phase to intervene early

        return () => {
            document.removeEventListener('click', handleLinkClick, true)
        }
    }, [])
}
