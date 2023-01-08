import { compute, xbackoff } from '../src'

describe('compute()', () => {
    it('should return the next timeout without a random spread', async () => {
        let n = 0
        const next = (): any => n++
        const opts = {
            randomize: false,
            minTimeout: 1000,
            maxTimeout: Infinity,
            factor: 2,
        }
        const res = Array.from({ length: 3 }).map(() => compute(next(), opts))
        expect(res).toEqual([1000, 2000, 4000])
    }) // test
    it('should return the next timeout with a random spread', async () => {
        jest.spyOn(Math, 'random').mockImplementation(() => 0.10)
        let n = 0
        const next = (): any => n++
        const opts = {
            randomize: true,
            minTimeout: 1000,
            maxTimeout: Infinity,
            factor: 2,
        }
        const res = Array.from({ length: 3 }).map(() => compute(next(), opts))
        expect(res).toEqual([1100, 2200, 4400])
    }) // test
    it('should stop incrementing the timeout when the maxTimeout is reached', async () => {
        let n = 0
        const next = (): any => n++
        const opts = {
            randomize: false,
            minTimeout: 1000,
            maxTimeout: 3500,
            factor: 2,
        }
        const res = Array.from({ length: 3 }).map(() => compute(next(), opts))
        expect(res).toEqual([1000, 2000, 3500])
    }) // test
}) // group

describe('xbackoff()', () => {
    it('should return the next timeout without a random spread', async () => {
        let n = 0
        const next = (): any => n++
        const opts = {
            randomize: false,
            minTimeout: 1000,
            maxTimeout: Infinity,
            factor: 2,
        }
        const getTimeout = xbackoff(opts)
        const res = Array.from({ length: 3 }).map(() => getTimeout(next()))
        expect(res).toEqual([1000, 2000, 4000])
    }) // test
    it('should return the next timeout with a random spread', async () => {
        jest.spyOn(Math, 'random').mockImplementation(() => 0.10)
        let n = 0
        const next = (): any => n++
        const opts = {
            randomize: true,
            minTimeout: 1000,
            maxTimeout: Infinity,
            factor: 2,
        }
        const getTimeout = xbackoff(opts)
        const res = Array.from({ length: 3 }).map(() => getTimeout(next()))
        expect(res).toEqual([1100, 2200, 4400])
    }) // test
    it('should stop incrementing the timeout when the maxTimeout is reached', async () => {
        let n = 0
        const next = (): any => n++
        const opts = {
            randomize: false,
            minTimeout: 1000,
            maxTimeout: 3500,
            factor: 2,
        }
        const getTimeout = xbackoff(opts)
        const res = Array.from({ length: 3 }).map(() => getTimeout(next()))
        expect(res).toEqual([1000, 2000, 3500])
    }) // test
    it('should throw an error if minTimeout is less than 1', async () => {
        expect(() => xbackoff({ minTimeout: 0 })).toThrowError(
            'Options.minTimeout must be a positive integer',
        )
    }) // test
    it('should throw an error if maxTimeout is less than 1', async () => {
        expect(() => xbackoff({ maxTimeout: 0 })).toThrowError(
            'Options.maxTimeout must be a positive integer',
        )
    }) // test
    it('should throw an error if minTimeout is greater than maxTimeout', async () => {
        expect(() => xbackoff({ minTimeout: 2, maxTimeout: 1 })).toThrowError(
            'Options.minTimeout must be less than or equal to maxTimeout',
        )
    }) // test
    it('should throw an error if factor is less than 1', async () => {
        expect(() => xbackoff({ factor: 0 })).toThrowError(
            'Options.factor must be a positive integer',
        )
    }) // test
    it('should not throw an error if the options are valid', async () => {
        expect(() => xbackoff({ minTimeout: 1, maxTimeout: 2, factor: 1 })).not.toThrowError()
    }) // test
}) // group
