export function randomUrlBase64Str(length: number): string {
	if (!Number.isInteger(length) || length < 0) throw new Error("Invalid length.")
	return Array.from(Array(length))
		.map(_ => base64ValueToChar(Math.floor(64 * Math.random())))
		.join("")
}

export function base64ValueToChar(base64Value: number): string {
	if (!Number.isInteger(base64Value) || base64Value < 0 || base64Value > 63) {
		throw new Error("Invalid base64 value.")
	} else if (base64Value < 10) {
		return String.fromCharCode(48 + base64Value)
	} else if (base64Value < 36) {
		return String.fromCharCode(87 + base64Value)
	} else if (base64Value < 62) {
		return String.fromCharCode(29 + base64Value)
	} else if (base64Value === 62) {
		return "-"
	} else {
		return "_"
	}
}