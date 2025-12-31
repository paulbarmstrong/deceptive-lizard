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
		const storedPayload: string | null = localStorage.getItem(params.localStorageKey)
		const parsedValue: T = (storedPayload !== null) ? (
			JSON.parse(storedPayload) as T
		) : (
			params.defaultValue
		)
		const returnValue: T = (params.wipePredicate !== undefined && params.wipePredicate(parsedValue)) ? (
			params.defaultValue
		) : (
			parsedValue
		)
		localStorage.setItem(params.localStorageKey, JSON.stringify(returnValue))
		return returnValue
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