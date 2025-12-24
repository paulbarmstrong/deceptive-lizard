import { DateTime } from "./DateTime"

interface Fulfillable<T> {
	fulfill: (t: T) => void
}

export class UpdateLimiter<T> {
	#fulfill: ((t: T) => void) | Fulfillable<T>
	#minIntervalMillis: number
	#patient: boolean
	#timeout: NodeJS.Timeout | undefined
	#resolvedAt: DateTime
	#latestObject: T | undefined

	constructor(fulfill: ((t: T) => void) | Fulfillable<T>, minIntervalMillis: number, patient: boolean) {
		this.#fulfill = fulfill
		this.#minIntervalMillis = minIntervalMillis
		this.#patient = patient
		this.#timeout = undefined
		this.#resolvedAt = new DateTime(0)
		this.#latestObject = undefined
	}

	#fulfillInternal(t: T) {
		this.#resolvedAt = new DateTime()
		if (typeof this.#fulfill === "function") {
			this.#fulfill(t)
		} else {
			this.#fulfill.fulfill(t)
		}
		if (this.#timeout !== undefined) clearTimeout(this.#timeout)
		this.#timeout = undefined
	}

	update(t: T) {
		this.#latestObject = t
		if (this.#patient) {
			if (this.#timeout !== undefined) clearTimeout(this.#timeout)
			this.#timeout = setTimeout(() => this.#fulfillInternal(t), this.#minIntervalMillis)
		} else {
			if (this.#timeout !== undefined) {
				const targetFulfillTime = this.#resolvedAt.plusMillis(this.#minIntervalMillis)
				clearTimeout(this.#timeout)
				this.#timeout = setTimeout(() => this.#fulfillInternal(t), targetFulfillTime.getMillis - DateTime.now.getMillis)
			} else if (this.#minIntervalMillis === 0 || this.#resolvedAt.isBefore(DateTime.now.minusMillis(this.#minIntervalMillis))) {
				this.#fulfillInternal(t)
			} else {
				this.#timeout = setTimeout(() => this.#fulfillInternal(t), this.#minIntervalMillis)
			}
		}
	}

	isPending(): boolean {
		return this.#timeout !== undefined
	}

	setMinIntervalMillis(newMinIntervalMillis: number) {
		if (newMinIntervalMillis !== this.#minIntervalMillis) {
			this.#minIntervalMillis = newMinIntervalMillis
			if (this.isPending() && this.#latestObject !== undefined) {
				this.update.bind(this)(this.#latestObject)
			}
		}
	}

	setPatient(newPatient: boolean) {
		if (newPatient !== this.#patient) {
			this.#patient = newPatient
			if (this.isPending() && this.#latestObject !== undefined) {
				this.update.bind(this)(this.#latestObject)
			}
		}
	}

	forceFulfill() {
		if (this.#latestObject !== undefined) this.#fulfillInternal.bind(this)(this.#latestObject)
	}

	destroy() {
		if (this.#timeout !== undefined) clearTimeout(this.#timeout)
	}
}