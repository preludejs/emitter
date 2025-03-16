import { expect, test, jest } from '@jest/globals'
import * as Emitter from './index.js'

type BaseEvents = Emitter.Events & {
  base: string
}

type ExtendedEvents = BaseEvents & {
  extended: number
}

class BaseEmitter<T extends BaseEvents> extends Emitter.Class<T> {}

class ExtendedEmitter extends BaseEmitter<ExtendedEvents> {}

test('base emitter should emit base events', () => {
  const emitter = new BaseEmitter()
  const listener = jest.fn()

  emitter.on('base', listener)
  emitter.emit('base', 'base-event')

  expect(listener).toHaveBeenCalledWith('base-event')
})

test('extended emitter should emit both base and extended events', () => {
  const emitter = new ExtendedEmitter()
  const baseListener = jest.fn()
  const extendedListener = jest.fn()

  emitter.on('base', baseListener)
  emitter.on('extended', extendedListener)

  emitter.emit('base', 'base-event')
  emitter.emit('extended', 123)

  expect(baseListener).toHaveBeenCalledWith('base-event')
  expect(extendedListener).toHaveBeenCalledWith(123)
})

test('meta events should work with inheritance', () => {
  const emitter = new ExtendedEmitter()
  const newListenerSpy = jest.fn()
  const removeListenerSpy = jest.fn()

  emitter.on('newListener', newListenerSpy)
  emitter.on('removeListener', removeListenerSpy)

  const listener = jest.fn()
  const off = emitter.on('extended', listener)
  off()

  expect(newListenerSpy).toHaveBeenCalledWith({
    name: 'extended',
    listener
  })

  expect(removeListenerSpy).toHaveBeenCalledWith({
    name: 'extended',
    listener
  })
})

test('error events should propagate properly in inheritance', () => {
  const emitter = new ExtendedEmitter()
  const errorListener = jest.fn()
  const error = new Error('test error')

  emitter.on('error', errorListener)
  emitter.on('base', () => {
    throw error
  })

  emitter.emit('base', 'base-event')

  expect(errorListener).toHaveBeenCalledWith(error)
})
