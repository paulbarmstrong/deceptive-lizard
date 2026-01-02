import { useEffect } from "react"

export function useBeforeUnloadAlert(hasUnsavedChanges: boolean) {
	useEffect(() => {
		if (!hasUnsavedChanges) return

		const onBeforeUnload = (e: BeforeUnloadEvent) => {
			e.preventDefault()
			e.returnValue = ""
		}

		window.addEventListener("beforeunload", onBeforeUnload)
		return () => window.removeEventListener("beforeunload", onBeforeUnload)
	}, [hasUnsavedChanges])
}