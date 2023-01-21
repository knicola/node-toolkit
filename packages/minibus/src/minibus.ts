import { SimpleEmitter } from './emitter'

/**
 * A generic event emitter interface to allow
 * swapping out the underlying implementation
 */
interface IEventEmitter {
    emit: (event: any, ...args: any[]) => any
    on: (event: any, listener: (...args: any[]) => void) => any
    once: (event: any, listener: (...args: any[]) => void) => any
    off: (event: any, listener: (...args: any[]) => void) => any
    removeAllListeners: (event?: any) => any
} // IEventEmitter

/**
 * Event handler
 * @param data The data to handle
 */
export type EventHandler<TData> = (data: TData) => void

// The TData generic is not used here, but it is required
// in order to pass the event type to the event handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Event<TData> {
    id: string
}

/**
 * Creates an event
 * @param id The id of the event
 * @returns The event
 * @example
 * const TestEvent = event<string>('test')
 */
export function event<TData> (id: string): Event<TData> {
    return { id }
} // event()

/**
 * A strongly typed event emitter
 * @example
 * ```typescript
 * import { EventBus, event } from '@knicola/minibus'
 *
 * const bus = new EventBus()
 *
 * const TestEvent = event<string>('test')
 *
 * bus.subscribe(TestEvent, (data) => {
 *  console.log(data)
 * })
 *
 * bus.dispatch(TestEvent, 'Hello World!')
 * ```
 */
export class EventBus {
    protected _emitter: IEventEmitter = new SimpleEmitter()

    /**
     * Dispatch a event
     * @param event The event to dispatch
     * @param data The data to dispatch with the event
     */
    public dispatch<TData> (ev: Event<TData>, data: TData): void {
        this._emitter.emit(ev.id, data)
    } // dispatch()

    /**
     * Subscribe a handler to a event
     * @param event The event to subscribe to
     * @param handler The handler to call when the event is dispatched
     */
    public subscribe<TData> (ev: Event<TData>, handler: EventHandler<TData>): void {
        this._emitter.on(ev.id, handler)
    } // subscribe()

    /**
     * Unsubscribe a handler from a event
     * @param event The event to unsubscribe from
     * @param handler The handler to unsubscribe
     */
    public unsubscribe<TData> (ev: Event<TData>, handler: EventHandler<TData>): void {
        this._emitter.off(ev.id, handler)
    } // unsubscribe()

    /**
     * Subscribe a handler to a event, but only once
     * @param ev The event to subscribe to
     * @param handler The handler to call when the event is dispatched
     */
    public once<TData> (ev: Event<TData>, handler: EventHandler<TData>): void {
        this._emitter.once(ev.id, handler)
    } // once()

    /**
     * Unsubscribe all handlers from a event or all messages
     * @param ev The event to unsubscribe from
     */
    public unsubscribeAll (ev?: Event<unknown>): void {
        if (ev) {
            this._emitter.removeAllListeners(ev.id)
        } else {
            this._emitter.removeAllListeners()
        }
    } // unsubscribeAll()
} // class

/**
 * Create a new instance of {@link EventBus}
 * @returns The new event bus
 * @example
 * ```typescript
 * import { minibus, event } from '@knicola/minibus'
 *
 * const bus = new minibus()
 *
 * const TestEvent = event<string>('test')
 *
 * bus.subscribe(TestEvent, (data) => {
 *  console.log(data)
 * })
 *
 * bus.dispatch(TestEvent, 'Hello World!')
 * ```
 */
export function minibus (): EventBus {
    return new EventBus()
} // minibus()
