/** Function that handles emitted events. */
export type Listener<T = unknown> =
  (value: T) =>
    void

/** Supported event name types. */
export type Name =
  | number
  | symbol
  | string

/** Named listener record for meta events. */
export type NamedListener<T = unknown> =
  { name: Name, listener: Listener<T> }

/** 
 * Event mapping type. 
 * Maps event names to their payload types.
 * Includes built-in meta events (newListener, removeListener, error).
 */
export type Events =
  Record<Name, unknown> & {
    newListener: NamedListener,
    removeListener: NamedListener,
    error: unknown
  }

/** Function that evaluates event payloads for conditional listeners. */
export type Predicate<T = unknown> =
  (value: T) =>
    boolean
