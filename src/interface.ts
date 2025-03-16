import type { Events, Listener, Predicate } from './prelude.js'

/**
 * Typed event emitter interface similar to EventEmitter from Node.js standard library.
 * Provides type-safe event handling with generics.
 */
export interface Interface<T extends Events> {

  /**
   * Lists all event names with active listeners.
   * @returns Array of event names that have registered listeners
   */
  eventNames(): (keyof T)[]

  /**
   * Gets all listeners for a given event name.
   * @param name - The event name to get listeners for
   * @returns Set of listeners or undefined if none exist
   */
  listeners<K extends keyof T>(name: K): Set<Listener<T[K]>> | undefined

  /**
   * Checks if an event has any listeners registered.
   * @param name - Optional event name to check
   * @param listener - Optional listener to check
   * @returns `true` if the event has listener(s), `false` otherwise.
   */
  hasListener(name?: keyof T, listener?: Listener<T[keyof T]>): boolean

  /**
   * Triggers an event, calling all registered listeners with the provided value.
   * @param name - The event name to emit
   * @param values - The payload to pass to listeners
   */
  emit<K extends keyof T>(name: K, ...values: T[K]): void

  /**
   * Removes one or more event listeners.
   *
   * @param name - Optional event name. If not provided, removes all listeners for all events.
   * @param listener - Optional listener to remove. If not provided but name is, removes all listeners for that event.
   * @returns Number of listeners removed
   *
   * @remarks
   * - If `listener` is provided: unregisters it if it exists, or no-op if it doesn't
   * - If `listener` is not provided but `name` is: unregisters all listeners for that event
   * - If `name` is not provided: unregisters all listeners for all events
   * - `removeListener` event is emitted for every listener that is removed
   * - After removal, if no listeners remain for an event, the event is removed from {@link eventNames}
   */
  off<K extends keyof T>(name?: K, listener?: Listener<T[K]>): number

  /**
   * Registers a new event listener.
   *
   * @param name - Event name to listen for
   * @param listener - Function to call when event is emitted
   * @returns Unregister function that removes this listener when called
   * @throws Error if the listener is already registered for this event
   */
  on<K extends keyof T>(name: K, listener: Listener<T[K]>): () => number

  /**
   * Registers a listener that will be called exactly once when the event is emitted.
   *
   * @param name - Event name to listen for
   * @param listener - Function to call when event is emitted
   * @returns Unregister function to remove the listener before it's triggered
   */
  once<K extends keyof T>(name: K, listener: Listener<T[K]>): () => void

  /**
   * Registers a listener that will be called once when an event matching the predicate is emitted.
   *
   * @param name - Event name to listen for
   * @param predicate - Function that evaluates if the event payload should trigger the listener
   * @param listener - Function to call when an event passes the predicate
   * @returns Unregister function to remove the listener before it's triggered
   */
  onceIf<K extends keyof T>(name: K, predicate: Predicate<T[K]>, listener: Listener<T[K]>): () => void

  /**
   * Creates a promise that resolves when the specified event is emitted.
   *
   * @param name - Event name to wait for
   * @param timeout - Maximum time to wait in milliseconds before rejecting with timeout error (default: 60 seconds)
   * @returns Promise that resolves with the event payload when emitted
   * @throws Error with code 'timeout' if event is not emitted within the timeout period
   */
  eventually<K extends keyof T>(name: K, timeout?: number): Promise<T[K]>

  /**
   * Creates a promise that resolves when an event matching the predicate is emitted.
   *
   * @param name - Event name to wait for
   * @param predicate - Function that evaluates if the event payload should resolve the promise
   * @param timeout - Maximum time to wait in milliseconds before rejecting with timeout error (default: 60 seconds)
   * @returns Promise that resolves with the event payload when predicate matches
   * @throws Error with code 'timeout' if matching event is not emitted within the timeout period
   */
  eventuallyIf<K extends keyof T>(name: K, predicate: Predicate<T[K]>, timeout?: number): Promise<T[K]>

}
