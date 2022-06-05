import * as E from './index.js'

test('simple', async () => {

  const messages: unknown[] = []

  const e = E.of<{
    message: ({ hello: string }) => void,
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

  e.emit('message', { hello: 'world' })
  e.emit('close')
  e.emit('message', { hello: 'mars' })

  expect(messages).toEqual([
    { hello: 'world' }
  ])

})
