import { useEffect, useRef } from "react"

export default function useInterval(work: () => void, delayMs: number, doImmediately: boolean, dependencies: Array<any>) {
	const interval = useRef<NodeJS.Timeout | undefined>(undefined)
	useEffect(() => {
		if (doImmediately) work()
		interval.current = setInterval(work, delayMs)
		return () => clearInterval(interval.current)
	}, dependencies)
}