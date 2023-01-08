import { shouldRecompute, compute, xfetch, XFetchCacheAdapter, MemoryAdapter } from '../src'

describe('shouldRecompute()', () => {
    it('should return true if the expiry time is in the past', () => {
        const expiry = 0
        const delta = 0
        const beta = 0
        expect(shouldRecompute(expiry, delta, beta)).toBe(true)
    }) // test
    it('should return true less often than false if beta is 1 and delta requires the same amount of time as the expiry time', () => {
        const expiry = Date.now() + 60e3
        const delta = 60e3
        const beta = 1
        const res = [...Array(200)].map(() => shouldRecompute(expiry, delta, beta))
        const truthy = res.filter((v) => v)
        const falsy = res.filter((v) => ! v)
        expect(truthy.length).toBeGreaterThan(0)
        expect(falsy.length).toBeGreaterThan(0)
        expect(falsy.length).toBeGreaterThan(truthy.length)
    }) // test
    it('should return true more often than false if beta is 2 and delta requires half the time as the expiry time', () => {
        const expiry = Date.now() + 60e3
        const delta = 60e3
        const beta = 2
        const res = [...Array(200)].map(() => shouldRecompute(expiry, delta, beta))
        const truthy = res.filter((v) => v)
        const falsy = res.filter((v) => ! v)
        expect(truthy.length).toBeGreaterThan(0)
        expect(falsy.length).toBeGreaterThan(0)
        expect(truthy.length).toBeGreaterThan(falsy.length)
    }) // test
    it('should always return false if delta requires a lot less time than the expiry time', () => {
        const expiry = Date.now() + 36e5
        const delta = 30e3
        const beta = 1
        const res = [...Array(200)].map(() => shouldRecompute(expiry, delta, beta))
        const truthy = res.filter((v) => v)
        const falsy = res.filter((v) => ! v)
        expect(truthy.length).toEqual(0)
        expect(falsy.length).toBeGreaterThan(0)
    }) // test
    it('should increase chances of returning true the higher the beta factor is', () => {
        const expiry = Date.now() + 36e5
        const delta = 30e3
        const beta = 100
        const res = [...Array(500)].map(() => shouldRecompute(expiry, delta, beta))
        const truthy = res.filter((v) => v)
        const falsy = res.filter((v) => ! v)
        expect(truthy.length).toBeGreaterThan(0)
        expect(falsy.length).toBeGreaterThan(0)
        expect(falsy.length).toBeGreaterThan(truthy.length)
    }) // test
    it('should default to beta = 1', () => {
        const expiry = 0
        const delta = 0
        const mathMaxSpy = jest.spyOn(Math, 'max')
        expect(shouldRecompute(expiry, delta)).toBe(true)
        expect(mathMaxSpy).nthCalledWith(1, 1, 0)
        expect(mathMaxSpy).nthCalledWith(2, 1, 1)
    }) // test
}) // group

describe('compute()', () => {
    it('should return the result of the function and the time it took to execute', async () => {
        const fn = (): number => 42
        const [res, delta] = await compute(fn)
        expect(res).toBe(42)
        expect(delta).toBeGreaterThanOrEqual(0)
    }) // test
    it('should return the result of the async function and the time it took to execute', async () => {
        const fn = async (): Promise<number> => 42
        const [res, delta] = await compute(fn)
        expect(res).toBe(42)
        expect(delta).toBeGreaterThanOrEqual(0)
    }) // test
}) // group

describe('xfetch()', () => {
    it('should return the value from the cache if it has not expired', async () => {
        const adapter: XFetchCacheAdapter = {
            get: jest.fn(() => ({
                value: 'hello',
                expiry: Date.now() + 36e5,
                delta: 0,
            })),
            set: jest.fn(),
        }
        const key = 'test'
        const ttl = 500
        const beta = 1
        const fn = jest.fn(() => 'world')
        const xfn = xfetch(fn, { key, ttl, beta, adapter })
        const res = await xfn()
        expect(res).toBe('hello')
        expect(fn).not.toHaveBeenCalled()
        expect(adapter.get).toHaveBeenCalledTimes(1)
        expect(adapter.set).not.toHaveBeenCalled()
    }) // test
    it('should call the function and return the result if the cache has expired', async () => {
        const adapter: XFetchCacheAdapter = {
            get: jest.fn(() => ({
                value: 'hello',
                expiry: 0,
                delta: 0,
            })),
            set: jest.fn(),
        }
        const key = 'test'
        const ttl = 500
        const beta = 1
        const fn = jest.fn(() => 'world')
        const xfn = xfetch(fn, { key, ttl, beta, adapter })
        const res = await xfn()
        expect(res).toBe('world')
        expect(fn).toHaveBeenCalledTimes(1)
        expect(adapter.get).toHaveBeenCalledTimes(1)
        expect(adapter.set).toHaveBeenCalledTimes(1)
    }) // test
    it('should call the function and return the result if the cache does not exist', async () => {
        const adapter: XFetchCacheAdapter = {
            get: jest.fn(() => ({
                value: undefined,
                expiry: 1000,
                delta: 0,
            })),
            set: jest.fn(),
        }
        const key = 'test'
        const ttl = 500
        const beta = 1
        const fn = jest.fn(() => 'world')
        const xfn = xfetch(fn, { key, ttl, beta, adapter })
        const res = await xfn()
        expect(res).toBe('world')
        expect(fn).toHaveBeenCalledTimes(1)
        expect(adapter.get).toHaveBeenCalledTimes(1)
        expect(adapter.set).toHaveBeenCalledTimes(1)
    }) // test
    it('should call the function and return the result if the cache has not expired but the recomputation is early', async () => {
        const adapter: XFetchCacheAdapter = {
            get: jest.fn(() => ({
                value: 'hello',
                expiry: Date.now() + 10e3,
                delta: 10e3,
            })),
            set: jest.fn(),
        }
        const key = 'test'
        const ttl = 500
        const beta = 1000
        const fn = jest.fn(() => 'world')
        const xfn = xfetch(fn, { key, ttl, beta, adapter })
        const res = await xfn()
        expect(res).toBe('world')
        expect(fn).toHaveBeenCalledTimes(1)
        expect(adapter.get).toHaveBeenCalledTimes(1)
        expect(adapter.set).toHaveBeenCalledTimes(1)
    }) // test
    it('should use the built-in adapter if none is provided', async () => {
        const key = 'test'
        const ttl = 500
        const beta = 1
        const fn = jest.fn(() => 'world')
        const xfn = xfetch(fn, { key, ttl, beta })
        const res = await xfn()
        expect(res).toBe('world')
        expect(fn).toHaveBeenCalledTimes(1)
    }) // test
}) // group

describe('MemoryAdapter', () => {
    it('should store and retrieve values', async () => {
        const adapter = new MemoryAdapter()
        const key = 'test'
        const value = 'hello'
        const ttl = 36e5
        const expiry = Date.now() + ttl
        const delta = 0
        adapter.set(key, { value, ttl, delta })
        const res = adapter.get(key)
        expect(res).toEqual({
            value,
            expiry,
            delta,
        })
    }) // test
    it('should return undefined if the key does not exist', async () => {
        const adapter = new MemoryAdapter()
        const key = 'test'
        const res = adapter.get(key)
        expect(res).toEqual({
            value: undefined,
            expiry: 0,
            delta: 0,
        })
    }) // test
}) // group
