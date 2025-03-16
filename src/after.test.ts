import { expect, test, jest, afterEach } from '@jest/globals'
import * as Emitter from './index.js'

afterEach(() => {
  jest.restoreAllMocks()
})

test('after should call callback after delay', async () => {
  const callback = jest.fn()
  Emitter.after(50, callback)
  expect(callback).not.toHaveBeenCalled()
  await new Promise(resolve => setTimeout(resolve, 60))
  expect(callback).toHaveBeenCalledTimes(1)
})

test('after should return cancellation function', async () => {
  const callback = jest.fn()
  const cancel = Emitter.after(50, callback)
  cancel()
  await new Promise(resolve => setTimeout(resolve, 60))
  expect(callback).not.toHaveBeenCalled()
})

test('calling cancel multiple times should log a warning', async () => {
  const callback = jest.fn()
  const cancel = Emitter.after(50, callback)
  const spy = jest.spyOn(Emitter.afterLog, 'warn')
  cancel()
  cancel()
  await new Promise(resolve => setTimeout(resolve, 60))
  expect(callback).not.toHaveBeenCalled()
  expect(spy).toHaveBeenCalledTimes(1)
})
