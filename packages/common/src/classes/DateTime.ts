export class DateTime {
	#MONTH_NAMES: Array<string> = ["January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December"]
	static get now() {
		return new DateTime()
	}
	static parse(iso: string) {
		return new DateTime(Date.parse(iso))
	}
	static fromDate(date: Date) {
		return new DateTime(date.getTime())
	}

	ms: number
	constructor(ms: number = Date.now()) {
		this.ms = ms
	}

	plusMillis(millis: number) { return new DateTime(this.ms + millis) }
	plusSeconds(seconds: number) { return new DateTime(this.ms + (1000 * seconds)) }
	plusMinutes(minutes: number) { return new DateTime(this.ms + (60 * 1000 * minutes)) }
	plusHours(hours: number) { return new DateTime(this.ms + (60 * 60 * 1000 * hours)) }
	plusDays(days: number) { return new DateTime(this.ms + (24 * 60 * 60 * 1000 * days)) }
	minusMillis(millis: number) { return new DateTime(this.ms - millis) }
	minusSeconds(seconds: number) { return new DateTime(this.ms - (1000 * seconds)) }
	minusMinutes(minutes: number) { return new DateTime(this.ms - (60 * 1000 * minutes)) }
	minusHours(hours: number) { return new DateTime(this.ms - (60 * 60 * 1000 * hours)) }
	minusDays(days: number) { return new DateTime(this.ms - (24 * 60 * 60 * 1000 * days)) }
	minus(other: DateTime) { return new DateTime(this.ms - other.ms) }
	get getMillis() { return this.ms }
	get getDate() { return new Date(this.ms) }
	isBefore(other: DateTime): boolean {
		return this.ms < other.ms
	}
	isAfter(other: DateTime): boolean {
		return this.ms > other.ms
	}
	get isBeforeNow() {
		return this.ms < Date.now()
	}
	get isAfterNow() {
		return this.ms > Date.now()
	}
	toISOString(): string {
		return new Date(this.ms).toISOString()
	}
	toLocalTimeString(): string {
		const date = new Date(this.ms)
		return `${date.toLocaleDateString()} ${date.toLocaleTimeString('en-us',{timeZoneName:'short'})}`
	}
	get year(): number {
		return new Date(this.ms).getFullYear()
	}
	get month(): string {
		return this.#MONTH_NAMES[new Date(this.ms).getMonth()]
	}
	get day(): number {
		return new Date(this.ms).getDate()
	}
}