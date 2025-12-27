
export function s(num: number) {
	return num === 1 ? "" : "s"
}

export function getTimeElapsedString(totalSeconds: number): string {
	const days = Math.floor(totalSeconds / (24 * 3600))
	const hours = Math.floor((totalSeconds / 3600) % 24)
	const minutes = Math.floor((totalSeconds % 3600) / 60)
	const seconds = totalSeconds % 60

	const daysStr = days > 0 ? `${days} day${s(days)}` : undefined
	const hoursStr = hours > 0 ? `${hours} hour${s(hours)}` : undefined
	const minutesStr = minutes > 0 ? `${minutes} minute${s(minutes)}` : undefined
	const secondsStr = daysStr !== undefined || hoursStr !== undefined || minutesStr !== undefined ? undefined : `${seconds} second${s(seconds)}`

	return [daysStr, hoursStr, minutesStr, secondsStr].filter(x => x !== undefined).join(", ")
}
