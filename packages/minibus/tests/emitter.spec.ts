import { SimpleEmitter } from '../src/emitter'

describe('EventEmitter', () => {
    let emitter: SimpleEmitter
    beforeEach(() => {
        emitter = new SimpleEmitter()
    }) // beforeEach()
    it('should create a new EventEmitter', () => {
        expect(emitter).toBeInstanceOf(SimpleEmitter)
    }) // test
    it('should emit events', () => {
        const spy = jest.fn()
        emitter.on('test', spy)
        emitter.emit('test', 'Hello World!')
        expect(spy).toHaveBeenCalledWith('Hello World!')
    }) // test
    it('should unsubscribe events', () => {
        const spy = jest.fn()
        emitter.on('test', spy)
        emitter.off('test', spy)
        emitter.emit('test', 'Hello World!')
        expect(spy).not.toHaveBeenCalled()
    }) // test
    it('should subscribe events once', () => {
        const spy = jest.fn()
        emitter.once('test', spy)
        emitter.emit('test', 'Hello World!')
        emitter.emit('test', 'Hello World!')
        expect(spy).toHaveBeenCalledTimes(1)
    }) // test
    it('should unsubscribe all events', () => {
        const spy = jest.fn()
        emitter.on('test', spy)
        emitter.on('test2', spy)
        emitter.removeAllListeners()
        emitter.emit('test', 'Hello World!')
        emitter.emit('test2', 'Hello World!')
        expect(spy).not.toHaveBeenCalled()
    }) // test
    it('should unsubscribe all events from a specific event', () => {
        const spy = jest.fn()
        emitter.on('test', spy)
        emitter.on('test2', spy)
        emitter.removeAllListeners('test')
        emitter.emit('test', 'Hello World!')
        emitter.emit('test2', 'Hello World!')
        expect(spy).toHaveBeenCalledTimes(1)
    }) // test
    it('should subscribe multiple listeners to the same event', () => {
        const spy = jest.fn()
        const spy2 = jest.fn()
        emitter.on('test', spy)
        emitter.on('test', spy2)
        emitter.emit('test', 'Hello World!')
        expect(spy).toHaveBeenCalledTimes(1)
        expect(spy2).toHaveBeenCalledTimes(1)
    }) // test
    it('should not subscribe the same listener twice to the same event', () => {
        const spy = jest.fn()
        emitter.on('test', spy)
        emitter.on('test', spy)
        emitter.emit('test', 'Hello World!')
        expect(spy).toHaveBeenCalledTimes(1)
    }) // test
    it('should not throw an error when unsubscribing a listener that is not subscribed', () => {
        expect(() => emitter.off('test', jest.fn())).not.toThrow()
    }) // test
}) // group
