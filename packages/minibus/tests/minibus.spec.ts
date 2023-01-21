import { event, EventBus, minibus } from '../src'

describe('minibus()', () => {
    let bus: EventBus
    const TestEvent1 = event<string>('test')
    const TestEvent2 = event<string>('test2')
    beforeEach(() => {
        bus = minibus()
    }) // beforeEach()
    it('should create a new EventBus', () => {
        expect(bus).toBeInstanceOf(EventBus)
    }) // test
    it('should dispatch events', () => {
        const spy = jest.fn()
        bus.subscribe(TestEvent1, spy)
        bus.dispatch(TestEvent1, 'Hello World!')
        expect(spy).toHaveBeenCalledWith('Hello World!')
    }) // test
    it('should unsubscribe events', () => {
        const spy = jest.fn()
        bus.subscribe(TestEvent1, spy)
        bus.unsubscribe(TestEvent1, spy)
        bus.dispatch(TestEvent1, 'Hello World!')
        expect(spy).not.toHaveBeenCalled()
    }) // test
    it('should subscribe events once', () => {
        const spy = jest.fn()
        bus.once(TestEvent1, spy)
        bus.dispatch(TestEvent1, 'Hello World!')
        bus.dispatch(TestEvent1, 'Hello World!')
        expect(spy).toHaveBeenCalledTimes(1)
    }) // test
    it('should unsubscribe all events', () => {
        const spy = jest.fn()
        bus.subscribe(TestEvent1, spy)
        bus.subscribe(TestEvent2, spy)
        bus.unsubscribeAll()
        bus.dispatch(TestEvent1, 'Hello World!')
        bus.dispatch(TestEvent2, 'Hello World!')
        expect(spy).not.toHaveBeenCalled()
    }) // test
    it('should unsubscribe all events from a specific event', () => {
        const spy = jest.fn()
        bus.subscribe(TestEvent1, spy)
        bus.subscribe(TestEvent2, spy)
        bus.unsubscribeAll(TestEvent1)
        bus.dispatch(TestEvent1, 'Hello World!')
        bus.dispatch(TestEvent2, 'Hello World!')
        expect(spy).toHaveBeenCalledTimes(1)
    }) // test
}) // group
