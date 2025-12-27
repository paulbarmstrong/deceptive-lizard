import { DependencyList, useEffect, useRef } from "react"

export function useFrames(onFrame: () => void, options?: {
	enabled?: boolean,
	deps?: DependencyList
}) {
	const frameRequest = useRef<number | undefined>(undefined)
	useEffect(() => {
		if (options?.enabled ?? true) {
			function refresh() {
				onFrame()
				frameRequest.current = window.requestAnimationFrame(refresh)
			}
			frameRequest.current = window.requestAnimationFrame(refresh)
			return (() => window.cancelAnimationFrame(frameRequest.current!))
		}
	}, [...(options?.deps ?? []), options?.enabled, onFrame])
}