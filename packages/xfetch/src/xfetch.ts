/**
 * Determines if a recomputation should be done early based on the expiry time,
 * the time it took to compute the value, and the beta factor
 * @see https://cseweb.ucsd.edu//~avattani/papers/cache_stampede.pdf
 * @param expiry The expiry time in milliseconds since the epoch
 * @param delta The required time to recompute the value in milliseconds
 * @param beta The beta factor. A value greater than 1 favors earlier recomputation
 * @returns true if recomputation should be done, false otherwise
 */
export function shouldRecompute (expiry: number, delta: number, beta: number = 1): boolean {
    return Date.now() - Math.max(1, delta) * Math.max(1, beta) * Math.log(Math.random()) >= expiry
} // shouldRecompute()

/**
 * Computes the result of a function and the time it took to execute
 * @param fn The function to execute
 * @returns The result of the function and the time it took to execute
 */
export async function compute <T> (fn: () => T): Promise<[T, number]> {
    const start = Date.now()
    const value = await Promise.resolve(fn())
    const delta = Date.now() - start
    return [value, delta]
} // compute()

export interface XFetchData {
    /**
     * The value to cache
     */
    value: any
    /**
     * The time it took to compute the value in milliseconds
     */
    delta: number
}
export interface XFetchGetData extends XFetchData {
    /**
     * The expiry time in milliseconds since the epoch
     */
    expiry: number
}
export interface XFetchSetData extends XFetchData {
    /**
     * The time to live in milliseconds
     */
    ttl: number
}
export interface XFetchCacheAdapter {
    get: (key: string) => XFetchGetData | Promise<XFetchGetData>
    set: (key: string, value: XFetchSetData) => void | Promise<void>
}

export interface XFetchOptions {
    /**
     * The key to use for the cache
     */
    key: string
    /**
     * The time to live in milliseconds
     */
    ttl: number
    /**
     * The beta factor. A value greater than 1 favors earlier recomputation
     * @default 1
     */
    beta: number
    /**
     * The cache adapter to use
     * @default MemoryAdapter
     * @see {@link MemoryAdapter}
     */
    adapter?: XFetchCacheAdapter
} // XFetchOptions

export type TaskFn = (...args: any[]) => any
export type AsyncTaskFn<T extends TaskFn> = (...args: Parameters<T>) => Promise<ReturnType<T>>

/**
 * Wraps a function in a cache layer that uses the probabilistic early
 * recomputation algorithm, XFetch, to mitigate cache stampedes
 * @see https://cseweb.ucsd.edu//~avattani/papers/cache_stampede.pdf
 * @param fn The function to call
 * @param options The options to use
 * @returns The function to call, wrapped in a cache layer
 */
export function xfetch <T extends TaskFn> (fn: T, options: XFetchOptions): AsyncTaskFn<T> {
    const { key, beta, ttl } = options
    const adapter = options.adapter || new MemoryAdapter()

    return (async (...args: any[]) => {
        let { value, delta, expiry } = await Promise.resolve(adapter.get(key))

        if (! value || shouldRecompute(expiry, delta, beta)) {
            [value, delta] = await compute(() => fn(...args))

            await Promise.resolve(adapter.set(key, { value, delta, ttl }))
        }

        return value
    }) as T
} // xfetch()

/**
 * A simple cache adapter that stores data in memory
 */
export class MemoryAdapter implements XFetchCacheAdapter {
    private cache: Record<string, XFetchGetData> = {}

    get (key: string): XFetchGetData {
        return this.cache[key] || {
            value: undefined,
            delta: 0,
            expiry: 0,
        }
    } // get()

    set (key: string, value: XFetchSetData): void {
        const { value: v, delta } = value
        this.cache[key] = {
            value: v,
            delta,
            expiry: Date.now() + value.ttl,
        }
    } // set()
} // class
