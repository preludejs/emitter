import { expect, test, jest } from '@jest/globals'
import * as Emitter from './index.js'

type TestEvents = Emitter.Events & {
  message: [ message: string ]
  data: [ data: { id: number, value: string } ]
  empty: []
}

test('eventNames should list all events with listeners', () => {
  const emitter = Emitter.of<TestEvents>()
  expect(emitter.eventNames()).toEqual([])

  const noop = () => {}
  emitter.on('message', noop)
  expect(emitter.eventNames()).toEqual(['message'])

  emitter.on('data', noop)
  expect(emitter.eventNames()).toContain('message')
  expect(emitter.eventNames()).toContain('data')
  expect(emitter.eventNames().length).toBe(2)

  emitter.off('message', noop)
  expect(emitter.eventNames()).toEqual(['data'])
})

test('listeners should return all listeners for an event', () => {
  const emitter = Emitter.of<TestEvents>()
  const listener1 = jest.fn()
  const listener2 = jest.fn()

  expect(emitter.listeners('message')).toBeUndefined()

  emitter.on('message', listener1)
  expect(emitter.listeners('message')?.size).toBe(1)
  expect(emitter.listeners('message')?.has(listener1)).toBe(true)

  emitter.on('message', listener2)
  expect(emitter.listeners('message')?.size).toBe(2)
  expect(emitter.listeners('message')?.has(listener1)).toBe(true)
  expect(emitter.listeners('message')?.has(listener2)).toBe(true)
})

test('hasListener should correctly check for listeners', () => {
  const emitter = Emitter.of<TestEvents>()
  const listener = jest.fn()

  expect(emitter.hasListener()).toBe(false)
  expect(emitter.hasListener('message')).toBe(false)
  expect(emitter.hasListener('message', listener)).toBe(false)

  emitter.on('message', listener)
  expect(emitter.hasListener()).toBe(true)
  expect(emitter.hasListener('message')).toBe(true)
  expect(emitter.hasListener('message', listener)).toBe(true)
  expect(emitter.hasListener('data')).toBe(false)

  emitter.off('message', listener)
  expect(emitter.hasListener('message')).toBe(false)
  expect(emitter.hasListener()).toBe(false)
})

test('emit should call all registered listeners', () => {
  const emitter = Emitter.of<TestEvents>()
  const listener1 = jest.fn()
  const listener2 = jest.fn()

  emitter.on('message', listener1)
  emitter.on('message', listener2)

  emitter.emit('message', 'hello')

  expect(listener1).toHaveBeenCalledWith('hello')
  expect(listener2).toHaveBeenCalledWith('hello')
})

test('emit should handle errors in listeners', () => {
  const emitter = Emitter.of<TestEvents>()
  const errorListener = jest.fn()
  const error = new Error('listener error')

  emitter.on('error', errorListener)

  emitter.on('message', () => {
    throw error
  })

  emitter.emit('message', 'hello')

  expect(errorListener).toHaveBeenCalledWith(error)
})

test('off should remove listeners', () => {
  const emitter = Emitter.of<TestEvents>()
  const messageListener1 = jest.fn()
  const messageListener2 = jest.fn()
  const dataListener = jest.fn()

  emitter.on('message', messageListener1)
  emitter.on('message', messageListener2)
  emitter.on('data', dataListener)

  const removed = emitter.off('message', messageListener1)
  expect(removed).toBe(1)
  emitter.emit('message', 'test')
  expect(messageListener1).not.toHaveBeenCalled()
  expect(messageListener2).toHaveBeenCalledWith('test')

  const removedAll = emitter.off('message')
  expect(removedAll).toBe(1)
  emitter.emit('message', 'test2')
  expect(messageListener2).toHaveBeenCalledTimes(1)

  emitter.on('message', messageListener1)
  const removedEverything = emitter.off()
  expect(removedEverything).toBe(2)
  expect(emitter.hasListener()).toBe(false)
})

test('on should register a listener and return unregister function', () => {
  const emitter = Emitter.of<TestEvents>()
  const listener = jest.fn()

  const off = emitter.on('message', listener)
  expect(emitter.hasListener('message', listener)).toBe(true)

  emitter.emit('message', 'test')
  expect(listener).toHaveBeenCalledWith('test')

  off()
  expect(emitter.hasListener('message', listener)).toBe(false)
})

test('on should emit newListener event', () => {
  const emitter = Emitter.of<TestEvents>()
  const newListenerSpy = jest.fn()
  const listener = jest.fn()
  emitter.on('newListener', newListenerSpy)
  emitter.on('message', listener)
  expect(newListenerSpy).toHaveBeenCalledWith('message', listener)
})

test('on should throw if registering the same listener twice', () => {
  const emitter = Emitter.of<TestEvents>()
  const listener = jest.fn()

  emitter.on('message', listener)

  expect(() => {
    emitter.on('message', listener)
  }).toThrow()
})

test('once should call listener only once', async () => {
  const emitter = Emitter.of<TestEvents>()
  const listener = jest.fn()

  emitter.once('message', listener)

  emitter.emit('message', 'first')
  emitter.emit('message', 'second')

  expect(listener).toHaveBeenCalledTimes(1)
  expect(listener).toHaveBeenCalledWith('first')
})

test('onceIf should call listener only when predicate matches', () => {
  const emitter = Emitter.of<TestEvents>()
  const listener = jest.fn()

  emitter.onceIf('message',
    message => message.includes('world'),
    listener
  )

  emitter.emit('message', 'hello')
  expect(listener).not.toHaveBeenCalled()

  emitter.emit('message', 'hello world')
  expect(listener).toHaveBeenCalledWith('hello world')

  emitter.emit('message', 'hello world again')
  expect(listener).toHaveBeenCalledTimes(1)
})

test('eventually should resolve when event is emitted', async () => {
  const emitter = Emitter.of<TestEvents>()

  Emitter.after(50, () => {
    emitter.emit('message', 'async response')
  })

  const [ result ] = await emitter.eventually('message', 1000)
  expect(result).toBe('async response')
})

test('eventually should reject on timeout', async () => {
  const emitter = Emitter.of<TestEvents>()

  await expect(emitter.eventually('message', 50)).rejects.toMatchObject({
    code: 'timeout'
  })
})

test('eventuallyIf should resolve when predicate matches', async () => {
  const emitter = Emitter.of<TestEvents>()

  Emitter.after(50, () => {
    emitter.emit('data', { id: 1, value: 'first' })
  })

  Emitter.after(100, () => {
    emitter.emit('data', { id: 2, value: 'second' })
  })

  const result = await emitter.eventuallyIf('data', data => data.id === 2, 1000)

  expect(result).toEqual([ { id: 2, value: 'second' } ])
})

test('off should emit removeListener event', () => {
  const emitter = Emitter.of<TestEvents>()
  const removeListenerSpy = jest.fn()
  const listener = jest.fn()
  emitter.on('removeListener', removeListenerSpy)
  const off = emitter.on('message', listener)
  off()
  expect(removeListenerSpy).toHaveBeenCalledWith('message', listener)
})

test('meta events work with standard event types', () => {
  const emitter = Emitter.of<TestEvents>()
  const metaListener = jest.fn()
  const regularListener = jest.fn()
  emitter.on('newListener', metaListener)
  emitter.on('message', regularListener)
  expect(metaListener).toHaveBeenCalledWith('message', regularListener)
})
