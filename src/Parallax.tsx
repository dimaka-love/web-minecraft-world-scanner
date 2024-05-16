import { useEffect, useRef } from 'react'

export default ({ children }) => {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const controller = new AbortController()
        document.addEventListener('mousemove', e => {
            if (ref.current) {
                const x = e.clientX / window.innerWidth
                const y = e.clientY / window.innerHeight
                const x2 = x * 2 - 1
                const y2 = y * 2 - 1
                // ref.current.style.transform = `translate(${(x2 * 0.3).toFixed(2)}%, ${(y2 * 0.3).toFixed(2)}%)`
            }
        })
        document.addEventListener('mouseleave', () => {
            if (ref.current) {
                ref.current.style.transform = ''
            }
        })

        return () => controller.abort()
    }, [])

    return (
        <div
            ref={ref}
            style={{
                position: 'absolute',
                overflow: 'hidden',
                width: '100%',
                height: '100%',
                zIndex: -1,
                transition: 'transform 0.1s ease-out',
            }}
        >
            {children}
        </div>
    )
}
