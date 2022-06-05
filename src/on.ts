import type { TypedEmitter, Listeners, UntypedListeners } from './emitter.js'

const on =
  <
    U extends keyof T,
    T extends Listeners<T> = UntypedListeners,
  >(
    emitter: TypedEmitter<T>,
    event: U,
    listener: T[U]
  ) => {
    emitter.on(event, listener)
    return () => {
      emitter.off(event, listener)
    }
  }

export default on
