import * as Emitter from './emitter.js'

const of =
  <T extends Emitter.Listeners<T> = Emitter.UntypedListeners>() =>
    new Emitter.default<T>()

export default of
