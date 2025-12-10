import { useState, useEffect } from 'react'

export function useGlitchText() {
    const [textState, setTextState] = useState(3)

    useEffect(() => {
        let timeoutIds: number[] = []

        const runLoop = () => {
            // t=0: State 3 (Full)
            setTextState(3)

            // t=10000: State 1 (Partial A) - 375ms duration
            timeoutIds.push(window.setTimeout(() => setTextState(1), 10000))

            // t=10375: State 2 (Partial B) - 375ms duration
            timeoutIds.push(window.setTimeout(() => setTextState(2), 10375))

            // t=10750: State 1 (Partial A) - 125ms duration
            timeoutIds.push(window.setTimeout(() => setTextState(1), 10750))

            // t=10875: State 2 (Partial B) - 125ms duration
            timeoutIds.push(window.setTimeout(() => setTextState(2), 10875))

            // t=11000: Loop (Restart)
            timeoutIds.push(window.setTimeout(runLoop, 11000))
        }

        runLoop()

        return () => {
            timeoutIds.forEach((id) => window.clearTimeout(id))
        }
    }, [])

    const getDisplayChar = (char: string, index: number) => {
        if (char === ' ') return ' '
        if (textState === 3) return char

        // Generic randomized visibility based on index and psuedo-random pattern
        // Using a simple modulo pattern to simulate randomness without storage
        const isVisibleState1 = (index * 7 + 3) % 2 === 0
        const isVisibleState2 = (index * 3 + 7) % 2 === 0

        if (textState === 1) return isVisibleState1 ? char : '_'
        if (textState === 2) return isVisibleState2 ? char : '_'
        return char
    }

    return { getDisplayChar }
}
