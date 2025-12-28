import { Json } from "common"
import { useRefState } from "./useRefState"
import { MutableRefObject } from "react"

export function usePersistentRefState<T extends Json>(params: {
	defaultValue: T,
	localStorageKey: string,
	wipePredicate?: (t: any) => boolean,
	sideEffect?: (t: T) => void
}): MutableRefObject<T> {
	const refState = useRefState<T>(() => {
		const value = localStorage.getItem(params.localStorageKey)
		if (value !== null) {
			const t = JSON.parse(value) as T
			if (params.wipePredicate !== undefined && params.wipePredicate(t)) {
				return params.defaultValue
			} else {
				return t
			}
		} else {
			return params.defaultValue
		}
	}, {
		sideEffect: t => {
			if (params.sideEffect !== undefined) params.sideEffect(t)
			if (t !== undefined) {
				localStorage.setItem(params.localStorageKey, JSON.stringify(t))
			} else {
				localStorage.removeItem(params.localStorageKey)
			}
		}
	})

	return refState
}