type EventHandler = (...args: any[]) => any
type Event = any

/**
 * A very simple event emitter that is used by the {@link Minibus} class
 * @internal
 */
export class SimpleEmitter {
    protected _events: Map<string, Set<EventHandler>>

    constructor () {
        this._events = new Map()
    } // constructor()

    /**
     * Add an event listener
     * @param event The event to listen for
     * @param handler The handler to call when the event is emitted
     */
    public on (event: Event, handler: EventHandler): void {
        this._events.get(event)?.add(handler)
            ?? this._events.set(event, new Set([handler]))
    } // on()

    /**
     * Remove an event listener
     * @param event The event to remove the listener from
     * @param handler The handler to remove
     */
    public off (event: Event, handler: EventHandler): void {
        this._events.get(event)?.delete(handler)
    } // off()

    /**
     * Add an event listener that will only be called once
     * @param event The event to listen for
     * @param handler The handler to call when the event is emitted
     */
    public once (event: Event, handler: EventHandler): void {
        const onceHandler = (...args: any[]): void => {
            this.off(event, onceHandler)
            handler(...args)
        }
        this.on(event, onceHandler)
    } // once()

    /**
     * Remove all listeners for an event or all events
     * @remarks
     * If no event is provided, all events will be removed
     * @param event The event to remove all listeners for
     */
    public removeAllListeners (event?: Event): void {
        if (event) {
            this._events.delete(event)
        } else {
            this._events.clear()
        }
    } // removeAllListeners()

    /**
     * Emit an event
     * @param event The event to emit
     * @param args The arguments to pass to the event handlers
     */
    public emit (event: Event, ...args: any[]): void {
        this._events.get(event)?.forEach((handler) => {
            handler(...args)
        })
    } // emit()
} // class
