import { AbortError, delay } from '../src'
import { flushPromises } from '@knicola/jest-utils'

describe('delay()', () => {
    jest.useFakeTimers()

    afterEach(async () => {
        jest.runAllTimers()
        await flushPromises()
    })
    it('should return a promise', async () => {
        const res = delay(1000)
        expect(res).toBeInstanceOf(Promise)
    }) // test
    it('should wait to resolve promise', async () => {
        const fn = jest.fn()
        const d = async (): Promise<void> => {
            await delay(1000)
            fn()
        }

        void d()

        jest.advanceTimersByTime(500)
        await flushPromises()

        expect(fn).not.toHaveBeenCalled()

        jest.advanceTimersByTime(500)
        await flushPromises()

        expect(fn).toHaveBeenCalled()
    }) // test
    it('should abort the delay', async () => {
        const ac = new AbortController()
        const d = delay(1000, ac.signal)
        ac.abort()
        await expect(d).rejects.toBeInstanceOf(AbortError)
    }) // test
    it('should abort right away if given signal was already aborted', async () => {
        const ac = new AbortController()
        ac.abort()
        const d = delay(1000, ac.signal)
        await expect(d).rejects.toBeInstanceOf(AbortError)
    }) // test
}) // group
