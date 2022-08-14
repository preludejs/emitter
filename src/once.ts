import type { TypedEmitter, Listeners, UntypedListeners } from './emitter.js'

const once =
  <Event extends keyof Listeners_, Listeners_ extends Listeners<Listeners_> = UntypedListeners>(
    emitter: TypedEmitter<Listeners_>,
    event: Event,
    timeout = Infinity
  ): Promise<Parameters<Listeners_[Event]>[0]> =>
    new Promise((resolve, reject) => {
      let timeoutId: undefined | ReturnType<typeof setTimeout>
      let listener: undefined | ((value: Parameters<Listeners_[Event]>[0]) => void) =
        (value: Parameters<Listeners_[Event]>[0]) => {
          if (timeoutId) {
            clearTimeout(timeoutId)
          }
          timeoutId = undefined
          resolve(value)
        }
      timeoutId =
        timeout < Infinity ?
          setTimeout(() => {
            if (listener) {
              emitter.removeListener(event, listener as Listeners_[Event])
              listener = undefined
            }
            reject(new Error(`Timeout of ${timeout} reached while waiting for event ${String(event)}.`))
          }, timeout) :
          undefined
      emitter.once(event, listener as Listeners_[Event])
    })

export default once
