import { cloneDeep } from "lodash"
import { UpdateLimiter } from "./UpdateLimiter"

export class UpdateQueue<T> {
	#updateFunction: (arg0: T) => Promise<boolean>
	#mergeFunction: ((arg0: T, arg1: T) => T) | undefined
	#queue: Array<T>
	#updateLimiter: UpdateLimiter<void>
	#queueStatusCallback: (isEmpty: boolean) => void
	#queueLocked: boolean
	#errorCallback: (arg0: Error, arg1: T) => void
	constructor(updateFunction: (arg0: T) => Promise<boolean>, mergeFunction: ((arg0: T, arg1: T) => T) | undefined, 
			minIntervalMillis: number, patient: boolean, queueStatusCallback: (isEmpty: boolean) => void, errorCallback: (arg0: Error, arg1: T) => void) {
		this.#updateFunction = updateFunction
		this.#mergeFunction = mergeFunction
		this.#queue = new Array<T>()
		this.#updateLimiter = new UpdateLimiter<void>(this.processQueue.bind(this), minIntervalMillis, patient)
		this.#queueStatusCallback = queueStatusCallback
		this.#queueLocked = false
		this.#errorCallback = errorCallback
	}

	add(mutation: T) {
		this.#queue.push(mutation)
		this.#updateLimiter.update()
		this.#queueStatusCallback(this.isEmpty())
	}

	async processQueue() {
		if (!this.#queueLocked) {
			if (this.#mergeFunction !== undefined && this.#queue.length > 1) {
				this.#queue = [this.#queue.reduce(this.#mergeFunction)]
			}
			try {
				this.#queueLocked = true
				const mutationOption: T | undefined = this.#queue.shift()
				if (mutationOption !== undefined) {
					const mutation: T = mutationOption
					try {
						const result = await this.#updateFunction(cloneDeep(mutation))
						if (!result) this.#queue.push(mutation)
					} catch (e) {
						this.#errorCallback(e as Error, mutation)
					}
				}
			} finally {
				this.#queueLocked = false
				this.#queueStatusCallback(this.isEmpty())
			}
		}
		if (this.#queue.length > 0) {
			this.#updateLimiter.update()
		}
	}

	isEmpty() {
		return this.#queue.length === 0 && !this.#queueLocked
	}

	setMinIntervalMillis(newMinIntervalMillis: number) {
		this.#updateLimiter.setMinIntervalMillis(newMinIntervalMillis)
	}

	setPatient(patient: boolean) {
		this.#updateLimiter.setPatient(patient)
	}

	forceUpdate() {
		this.#updateLimiter.forceFulfill()
	}

	destroy() {
		this.#updateLimiter.destroy()
	}
}