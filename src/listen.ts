import type { TypedEmitter, Listeners, UntypedListeners } from './emitter.js'

const listen =
  <T extends Listeners<T> = UntypedListeners>(
    emitter: TypedEmitter<T>,
    listeners: Partial<T>
  ) => {
    Object
      .entries(listeners)
      .forEach(([ event, listener ]) => {
        emitter.on(event as keyof T, listener as T[keyof T])
      })
    return () => {
      Object
        .entries(listeners)
        .forEach(([ event, listener ]) => {
          emitter.off(event as keyof T, listener as T[keyof T])
        })
    }
  }

export default listen
