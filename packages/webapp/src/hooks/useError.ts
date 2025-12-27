import { useState } from "react"

export function useError(): [Error | undefined, (error: Error | undefined) => void, <T>(work: () => Promise<T>) => Promise<T | undefined>] {
	const [errorInternal, setErrorInternal] = useState<Error | undefined>(undefined)

	function setError(error: Error | undefined) {
		if (error !== undefined) {
			console.error(error)
			window.scrollTo(0, 0)
		}
		setErrorInternal(error)
	}

	async function withError<T>(work: () => Promise<T>): Promise<T | undefined> {
		try {
			return await work()
		} catch (error) {
			setError(error as Error)
			return undefined
		}
	}

	return [errorInternal, setError, withError]
}