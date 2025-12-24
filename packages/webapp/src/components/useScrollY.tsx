import { useLayoutEffect, useState } from "react"

export function useScrollY() {
	const [scrollY, setScrollY] = useState<number>(window.scrollY)

	useLayoutEffect(() => {
		window.addEventListener("scroll", update)
		return () => window.removeEventListener("scroll", update)
	}, [])

	function update() {
		setScrollY(window.scrollY)
	}

	return scrollY
}