import * as Log from '@prelude/log'

declare function setTimeout(callback: (...args: any[]) => void, ms: number, ...args: any[]): number

declare function clearTimeout(timeoutId: number): void

const log = Log.of('@prelude/emitter:after')

export { log as afterLog }

/**
 * Calls `callback` after `milliseconds` delay.
 * @param milliseconds - Delay in milliseconds before callback is executed
 * @param callback - Function to call after the delay
 * @returns Cancellation function that prevents the callback from being called
 */
export const after =
  (milliseconds: number, callback: () => void) => {
    let id: null | ReturnType<typeof setTimeout> = setTimeout(callback, milliseconds)
    return () => {
      if (id == null) {
        log.warn('Expected off function to be called at most once.')
        return
      }
      clearTimeout(id)
      id = null
    }
  }

export default after
