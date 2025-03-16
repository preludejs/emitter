import * as Err from '@prelude/err'
import * as Log from '@prelude/log'
import after from './after.js'
import type { Interface } from './interface.js'
import type { Listener, Events, Predicate } from './prelude.js'

const log = Log.of('@prelude/emitter')

/**
 * Threshold for logging error when number of listeners exceeds this value.
 * Used to detect potential memory leaks from too many listeners.
 */
export const errorLogThreshold = 512

/**
 * Typed event emitter similar to EventEmitter from Node.js standard library.
 * Provides type-safe event handling with generics.
 */
export class Emitter<T extends Events> implements Interface<T> {

  /** Internal map storing event listeners by event name. */
  readonly _listeners = new Map<keyof T, Set<Listener>>()

  /**
   * Lists all event names with active listeners.
   * @returns Array of event names
   */
  eventNames(): (keyof T)[] {
    return Array.from(this._listeners.keys())
  }

  /**
   * Gets all listeners for a given event name.
   * @param name - The event name to get listeners for
   * @returns Set of listeners or undefined if none exist
   */
  listeners<K extends keyof T>(name: K) {
    return this._listeners.get(name) as undefined | Set<Listener<T[K]>>
  }

  /**
   * Checks if an event has any listeners registered.
   * @param name - Optional event name to check
   * @param listener - Optional listener to check
   * @returns `true` if the event has listener(s), `false` otherwise.
   */
  hasListener<K extends keyof T>(name?: K, listener?: Listener<T[K]>): boolean {
    if (name == null) {
      return this._listeners.size > 0
    }
    if (listener == null) {
      return this._listeners.has(name)
    }
    return this.listeners(name)?.has(listener) ?? false
  }

  /**
   * Triggers an event, calling all registered listeners with the provided value.
   * Errors in listeners are caught and logged without interrupting other listeners.
   * @param name - The event name to emit
   * @param value - The payload to pass to listeners
   */
  emit<K extends keyof T>(name: K, value: T[K]) {
    for (const listener of this.listeners(name) ?? []) {
      try {
        listener(value)
      } catch (err) {
        if (name !== 'error' && this.hasListener('error')) {
          this.emit('error', err)
        } else {
          log.error(`Error while trying to emit ${String(name)} event for ${String(listener)} listener.`, err)
        }
      }
    }
  }

  /**
   * Removes one or more event listeners.
   *
   * @param maybeName - Optional event name. If not provided, removes all listeners for all events.
   * @param maybeListener - Optional listener to remove. If not provided but name is, removes all listeners for that event.
   * @returns Number of listeners removed
   */
  off<K extends keyof T>(maybeName?: K, maybeListener?: Listener<T[K]>): number {
    if (maybeName == null) {
      return this
        .eventNames()
        .reduce<number>((n, name) => n + this.off(name), 0)
    }
    const listeners = this.listeners(maybeName)
    if (listeners == null) {
      return 0
    }
    if (maybeListener == null) {
      return Array
        .from(listeners)
        .reduce((n, listener) => n + this.off(maybeName, listener), 0)
    }
    if (listeners.delete(maybeListener)) {
      this.emit('removeListener', {
        name: maybeName,
        listener: maybeListener as Listener
      })
      if (listeners.size === 0) {
        this._listeners.delete(maybeName)
      }
      return 1
    }
    return 0
  }

  /**
   * Registers a new event listener.
   *
   * @param name - Event name to listen for
   * @param listener - Function to call when event is emitted
   * @returns Unregister function that removes this listener when called
   * @throws Error if the listener is already registered for this event
   */
  on<K extends keyof T>(name: K, listener: Listener<T[K]>) {
    let listeners = this.listeners(name)
    if (!listeners) {
      listeners = new Set
      this._listeners.set(name, listeners as Set<Listener>)
    }
    if (listeners.has(listener as Listener)) {
      throw Err.error('duplicate', `Expected listener to not be already registered for ${String(name)} event.`)
    }
    listeners.add(listener as Listener)
    this.emit('newListener', {
      name,
      listener: listener as Listener
    })
    const n = listeners.size
    if (n > errorLogThreshold) {
      log.error(`Expected less than ${errorLogThreshold} listeners for ${String(name)} event, got ${n}.`)
    }
    return () => this.off(name, listener)
  }

  /**
   * Registers a listener that will be called once when an event matching the predicate is emitted.
   *
   * @param name - Event name to listen for
   * @param predicate - Function that evaluates if the event payload should trigger the listener
   * @param listener - Function to call when an event passes the predicate
   * @returns Unregister function to remove the listener before it's triggered
   */
  onceIf<K extends keyof T>(name: K, predicate: Predicate<T[K]>, listener: Listener<T[K]>) {
    const off = this.on(name, value => {
      if (predicate(value)) {
        off()
        listener(value)
      }
    })
    return off
  }

  /**
   * Registers a listener that will be called exactly once when the event is emitted.
   *
   * @param name - Event name to listen for
   * @param listener - Function to call when event is emitted
   * @returns Unregister function to remove the listener before it's triggered
   */
  once<K extends keyof T>(name: K, listener: Listener<T[K]>) {
    return this.onceIf(name, () => true, listener)
  }

  /**
   * Creates a promise that resolves when an event matching the predicate is emitted.
   *
   * @param name - Event name to wait for
   * @param predicate - Function that evaluates if the event payload should resolve the promise
   * @param timeout - Maximum time to wait in milliseconds before rejecting with timeout error
   * @returns Promise that resolves with the event payload when predicate matches
   */
  eventuallyIf<K extends keyof T>(
    name: K,
    predicate: Predicate<T[K]>,
    timeout = 60 * 1000
  ): Promise<T[K]> {
    return new Promise((resolve, reject) => {
      let off: null | (() => void) = null
      let offTimeout: null | (() => void) = null
      offTimeout = after(timeout, () => {
        offTimeout = null
        off?.()
        off = null
        reject(Err.error('timeout', `Timeout of ${timeout} reached while waiting for ${String(name)} event.`))
      })
      off = this.on(name, value => {
        if (predicate(value)) {
          off = null
          offTimeout?.()
          offTimeout = null
          resolve(value)
        }
      })
    })
  }

  /**
   * Creates a promise that resolves when the specified event is emitted.
   *
   * @param name - Event name to wait for
   * @param timeout - Maximum time to wait in milliseconds before rejecting with timeout error
   * @returns Promise that resolves with the event payload when emitted
   */
  eventually<K extends keyof T>(name: K, timeout = 60 * 1000): Promise<T[K]> {
    return this.eventuallyIf(name, () => true, timeout)
  }

}

export const of =
  <T extends Events>(...args: ConstructorParameters<typeof Emitter>) =>
    new Emitter<T>(...args)

export default Emitter
