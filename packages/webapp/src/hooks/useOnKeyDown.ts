import { DependencyList } from "react"
import { useEffect } from "react"

export function useOnKeyDown(onKeyDown: (arg0: globalThis.KeyboardEvent) => void, deps: DependencyList | undefined = undefined) {
	useEffect(() => {
		document.addEventListener("keydown", onKeyDown)
		return () => document.removeEventListener("keydown", onKeyDown)
	}, deps)
}