import { expect, test } from '@jest/globals'
import * as Emitter from './index.js'

type MyWebsocketEvents = {
  open: undefined,
  message: string,
  close: { code: number | string, reason: string },
  error: unknown
} & Emitter.Events

class MyWebsocket<T extends MyWebsocketEvents> extends Emitter.Class<T> {
  constructor() {
    super()
    this.emit('open', undefined)
  }
}

type MyClientEvents = {
  connect: string,
  disconnect: string
} & MyWebsocketEvents

class MyClient extends MyWebsocket<MyClientEvents> {
  constructor() {
    super()
    this.emit('connect', 'my-url')
  }
}

test('should pass', async () => {
  const client: Emitter.Interface<MyClientEvents> = new MyClient()
  Emitter.after(1_000, () => {
    client.emit('message', 'did-login')
  })
  await expect(client.eventuallyIf('message', message => message.startsWith('did'))).resolves.toEqual('did-login')
})
