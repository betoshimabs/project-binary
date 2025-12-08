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
        // Space (index 7) is always visible
        if (index === 7) return ' '
        if (textState === 3) return char

        // State 1 Visible Indices: P(0), o(2), e(4), t(6), i(9), a(11), y(13)
        const state1Visible = [0, 2, 4, 6, 9, 11, 13].includes(index)

        if (textState === 1) return state1Visible ? char : '_'
        if (textState === 2) return !state1Visible ? char : '_'
        return char
    }

    return { getDisplayChar }
}
