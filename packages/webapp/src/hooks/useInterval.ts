import { useEffect, useRef } from "react"

export default function useInterval(work: () => void, delayMs: number, dependencies: Array<any>) {
	const interval = useRef<NodeJS.Timeout | undefined>(undefined)
	useEffect(() => {
		interval.current = setInterval(work, delayMs)
		return () => clearInterval(interval.current)
	}, dependencies)
}