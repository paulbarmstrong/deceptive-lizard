import { Json } from "common"

export async function http(url: string, options?: RequestInit): Promise<Json> {
	const res = await fetch(url, options)
	const responseObj = await (async () => {
		try {
			return await res.json()
		} catch (error) {
			throw new Error(res.statusText)
		}
	})()
	if (res.ok) {
		return responseObj
	} else {
		throw new Error(responseObj.message ?? res.statusText)
	}
}
