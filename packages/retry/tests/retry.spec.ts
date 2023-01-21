import { retry, Retry, AbortError } from '../src'

describe('Retry - Validate Options', () => {
    const noop = (): void => {}
    test('Parameter "task" is required', async () => {
        // @ts-expect-error > ts(2345)
        expect(() => retry()).toThrowError('Parameter "task" is required')
    }) // test
    test('Parameter "task" is required', async () => {
        const task = 'not a function'
        // @ts-expect-error > ts(2345)
        expect(() => retry(task)).toThrowError('Parameter "task" must be a function')
    }) // test
    test.each([
        'retries',
        'factor',
        'minTimeout',
        'maxTimeout',
    ])('Options.%s must be a positive integer', async (name) => {
        const opts = { [name]: -1 }
        expect(() => retry(noop, opts)).toThrowError(`Options.${name} must be a positive integer`)
    }) // test
    test.each([
        'retries',
        'factor',
        'minTimeout',
        'maxTimeout',
    ])('Options.%s must be a number', async (name) => {
        const opts = { [name]: 'not a number' }
        expect(() => retry(noop, opts)).toThrowError(`Options.${name} must be a positive integer`)
    }) // test
    test('Options.maxTimeout must be greater than Options.minTimeout', async () => {
        const opts = { minTimeout: 3, maxTimeout: 1 }
        expect(() => retry(noop, opts)).toThrowError('Options.maxTimeout must be greater than Options.minTimeout')
    }) // test
    test('Options.randomize must be a boolean', async () => {
        const opts = { randomize: 'not a boolean' }
        // @ts-expect-error > ts(2345)
        expect(() => retry(noop, opts)).toThrowError('Options.randomize must be a boolean')
    }) // test
    it('should set default options', async () => {
        const { options } = retry(noop)
        expect(options).toEqual({
            retries: 5,
            factor: 2,
            minTimeout: 1e3,
            maxTimeout: 60e3,
            randomize: false,
        })
    }) // test
}) // group

describe('Retry', () => {
    let op: Retry<string>
    let task: jest.Mock
    beforeEach(() => {
        task = jest.fn()
        op = retry(task, {
            retries: 3,
            factor: 2,
            minTimeout: 1,
            maxTimeout: 500,
            randomize: true,
        })
    })
    afterEach(() => {
        op?.abort()
        jest.restoreAllMocks()
    })
    it('should return an instance of Retry', async () => {
        expect(retry(task)).toBeInstanceOf(Retry)
    }) // test
    it('should run the task when awaited', async () => {
        task.mockReturnValueOnce('success')
        const res = await retry(task)
        expect(res).toEqual('success')
    }) // test
    it('should resolve immediately if no errors occur', async () => {
        task.mockResolvedValueOnce('success')
        const res = await op.run()
        expect(res).toEqual('success')
    }) // test
    it('should work with synchronous tasks', async () => {
        task.mockReturnValueOnce('success')
        const res = await op.run()
        expect(res).toEqual('success')
    }) // test
    it('should retry a failed task', async () => {
        task
            .mockRejectedValueOnce('fail#1')
            .mockRejectedValueOnce('fail#2')
            .mockResolvedValueOnce('success')
        const res = await op.run()
        expect(task).toBeCalledTimes(3)
        expect(res).toEqual('success')
    }) // test
    it('should throw when max retries is reached', async () => {
        task
            .mockRejectedValueOnce('fail#1')
            .mockRejectedValueOnce('fail#2')
            .mockRejectedValueOnce('fail#3')
            .mockRejectedValueOnce('fail#4')
        await expect(op.run()).rejects.toEqual('fail#4')
        expect(task).toBeCalledTimes(4)
    }) // test
    it('should abort a running task', async () => {
        task.mockRejectedValue('errr')
        const res = op.run()
        op.abort()
        await expect(res).rejects.toBeInstanceOf(AbortError)
    }) // test
    it('should not throw when .abort() is called before .run()', async () => {
        expect(() => op.abort()).not.toThrow()
    }) // test
    it('should indicate whether task is running or not', async () => {
        task
            .mockRejectedValueOnce('fail#1')
            .mockRejectedValueOnce('fail#2')
            .mockResolvedValueOnce('success')
        expect(op.isRunning).toBe(false)
        const res = op.run()
        expect(op.isRunning).toBe(true)
        await res
        expect(op.isRunning).toBe(false)
    }) // test
    it('should run when awaited', async () => {
        task.mockResolvedValueOnce('success')
        const res = await op
        expect(res).toEqual('success')
    }) // test
    it('should not execute the task twice if it is run twice', async () => {
        task.mockResolvedValueOnce('success')
        const res1 = op.run()
        const res2 = op.run()
        expect(task).toBeCalledTimes(1)
        expect(await res1).toEqual('success')
        expect(await res2).toEqual('success')
    }) // test
}) // group
