import { repeat, Repeat } from '../src/index'
import { advanceTimers, flushPromises } from '@knicola/jest-utils'

describe('repeat - validation', () => {
    const task = jest.fn()
    it('should not complain about optional properties', async () => {
        expect(() => repeat(task)).not.toThrowError()
    }) // test
    test('Options.task is required', async () => {
        // @ts-expect-error > ts(2345)
        expect(() => repeat()).toThrowError('Parameter "task" is required')
    }) // test
    test('Options.task must be a function', async () => {
        const task = 'not a function'
        // @ts-expect-error > ts(2345)
        expect(() => repeat(task)).toThrowError('Parameter "task" must be a function')
    }) // test
    test('Options.timeout must be a positive integer', async () => {
        const opts = { timeout: -1 }
        expect(() => repeat(task, opts)).toThrowError('Options.timeout must be a positive integer')
    }) // test
    test('Options.timeout must be a number', async () => {
        const opts = { timeout: 'not a number' }
        // @ts-expect-error > ts(2345)
        expect(() => repeat(task, opts)).toThrowError('Options.timeout must be a positive integer')
    }) // test
    test.each([
        'onStart',
        'onComplete',
        'onFail',
        'onError',
    ])('Options.%s must be a function', async (name) => {
        const opts = { timeout: 3000, [name]: 'not a function' }
        expect(() => repeat(task, opts)).toThrowError(`Options.${name} must be a function`)
    }) // test
    test.each([
        'maxRuns',
        'maxFailures',
    ])('Options.%s must be a positive integer', async (name) => {
        const opts = { timeout: 3000, [name]: 'not a number' }
        expect(() => repeat(task, opts)).toThrowError(`Options.${name} must be a positive integer`)
    })
    test('Options.runOnStart must be a boolean', async () => {
        const opts = { timeout: 3000, runOnStart: 'not a boolean' }
        // @ts-expect-error > ts(2345)
        expect(() => repeat(task, opts)).toThrowError('Options.runOnStart must be a boolean')
    }) // test
    test('Options.startOnInit must be a boolean', async () => {
        const opts = { timeout: 3000, startOnInit: 'not a boolean' }
        // @ts-expect-error > ts(2345)
        expect(() => repeat(task, opts)).toThrowError('Options.startOnInit must be a boolean')
    }) // test
}) // group

describe('repeat', () => {
    jest.useFakeTimers()

    let op: Repeat
    const timeout = 1000
    const maxRuns = 3
    const maxFailures = 2
    let onStart: jest.Mock
    let task: jest.Mock
    let onComplete: jest.Mock
    let onFail: jest.Mock
    let onError: jest.Mock
    beforeEach(() => {
        onStart = jest.fn()
        task = jest.fn()
        onComplete = jest.fn()
        onFail = jest.fn()
        onError = jest.fn()
        op = repeat(task, {
            timeout,
            onStart,
            startOnInit: false,
        })
    })
    afterEach(() => {
        op.stop()
    })
    it('should return an instance of Repeat', async () => {
        expect(repeat(task)).toBeInstanceOf(Repeat)
    }) // test
    it('should call task on start', async () => {
        op.start()
        await flushPromises()
        expect(task).toHaveBeenCalledTimes(1)
    }) // test
    it('should start the repeat operation on init', async () => {
        op = repeat(task, { timeout, startOnInit: true })
        await flushPromises()
        expect(task).toHaveBeenCalledTimes(1)
    }) // test
    it('should not start the repeat operation on init when startOnInit is false', async () => {
        op = repeat(task, { timeout, startOnInit: false })
        await flushPromises()
        expect(task).toHaveBeenCalledTimes(0)
    }) // test
    it('should not call task on start when runOnStart is false', async () => {
        op = repeat(task, timeout, { runOnStart: false })
        op.start()
        await flushPromises()
        expect(task).toBeCalledTimes(0)
        await advanceTimers(1000, 2)
        expect(task).toBeCalledTimes(2)
    }) // test
    it('should call task repeatedly', async () => {
        op.start()
        await advanceTimers(1000, 4)
        expect(task).toHaveBeenCalledTimes(5)
    }) // test
    it('should still call task repeatedly when runOnStart is false', async () => {
        op = repeat(task, { timeout, runOnStart: false })
        op.start()
        await advanceTimers(1000, 4)
        expect(task).toHaveBeenCalledTimes(4)
    }) // test
    it('should call onStart once when the task is started', async () => {
        op.start()
        await flushPromises()
        expect(onStart).toHaveBeenCalledTimes(1)
        expect(task).toHaveBeenCalledTimes(1)
        await advanceTimers(1000, 2)
        expect(onStart).toHaveBeenCalledTimes(1)
        expect(task).toHaveBeenCalledTimes(3)
    }) // test
    it('should indicate whether task is running', async () => {
        expect(op.isRunning).toBe(false)
        op.start()
        expect(op.isRunning).toBe(true)
    }) // test
    it('should not run twice if already running', async () => {
        const exec = jest.fn()
        // @ts-expect-error > ts(2445)
        op._exec = exec
        op.start()
        op.start()
        expect(exec).toBeCalledTimes(1)
    }) // test
    it('should await a promise task', async () => {
        let n = 0
        op = repeat(async () => (n += await Promise.resolve(1)), timeout)
        op.start()
        await flushPromises()
        expect(n).toEqual(1)
        await advanceTimers(500, 1)
        expect(n).toEqual(1)
        await advanceTimers(500, 1)
        expect(n).toEqual(2)
    }) // test
    it('should exit after maxRuns is reached', async () => {
        op = repeat(task, { timeout, maxRuns })
        op.start()
        await advanceTimers(1000, 3)
        expect(op.isRunning).toBe(false)
    }) // test
    it('should call onComplete and exit when maxRuns and onComplete are given', async () => {
        op = repeat(task, { timeout, maxRuns, onComplete })
        op.start()
        await advanceTimers(1000, 3)
        expect(onComplete).toBeCalledTimes(1)
    }) // test
    it('should exit after maxFailures is reached', async () => {
        task.mockRejectedValue('err')
        op = repeat(task, { timeout, maxFailures })
        await advanceTimers(1000, 2)
        expect(op.isRunning).toBe(false)
    }) // test
    it('should call onFail before exit when maxFailures and onFail are given', async () => {
        task.mockRejectedValue('err')
        op = repeat(task, { timeout, maxFailures, onFail })
        await advanceTimers(1000, 2)
        expect(onFail).toBeCalledTimes(1)
    }) // test
    it('should call onError when task throws an error', async () => {
        task.mockRejectedValue('err')
        op = repeat(task, { timeout, onError })
        await advanceTimers(1000, 2)
        expect(onError).toBeCalledTimes(3)
    }) // test
}) // group
