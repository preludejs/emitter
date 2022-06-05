import * as E from './index.js'

test('simple', async () => {

  const messages: unknown[] = []

  const e = E.of<{
    message: (_: { hello: string }) => void,
    close: () => void
  }>()

  const off = E.listen(e, {
    message: _ => {
      messages.push(_)
    },
    close: () => {
      off()
    }
  })

  expect(e.listenerCount('message')).toBe(1)
  expect(e.listenerCount('close')).toBe(1)

  e.emit('message', { hello: 'world' })
  e.emit('close')
  e.emit('message', { hello: 'mars' })

  expect(messages).toEqual([
    { hello: 'world' }
  ])

  expect(e.listenerCount('message')).toBe(0)
  expect(e.listenerCount('close')).toBe(0)

})
