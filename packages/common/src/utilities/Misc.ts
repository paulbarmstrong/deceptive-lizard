export function lazy<T extends object>(initialize: () => T): T {
    let instance: T | undefined = undefined
    return new Proxy<T>({} as T, {
        get: (target, property, receiver) => {
            if (instance === undefined) instance = initialize()
            return Reflect.get(instance, property, receiver)
        },
        set: (target, property, value, receiver) => {
            if (instance === undefined) instance = initialize()
            return Reflect.set(instance, property, value, receiver)
        }
    })
}
