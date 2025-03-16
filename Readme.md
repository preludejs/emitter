# @prelude/emitter

A type-safe event emitter with generic support, inspired by Node.js EventEmitter but with strong TypeScript typing.

## Features

- Fully typed event handling with generic support
- Promise-based event waiting with `eventually` and `eventuallyIf`
- Conditional event listeners with predicates
- One-time event listeners
- Error handling with automatic propagation to error event
- Memory leak detection for excessive listeners
- Functional programming approach

## Installation

```bash
pnpm add -E @prelude/emitter
```

## Usage

```ts
import * as Emitter from '@prelude/emitter'

// Define your events
type MyEvents = Emitter.Events & {
  start: [ { timestamp: number } ],
  progress: [ progress: { percent: number } ],
  complete: [ { result: string } ],
  error: [ Error ]
} & Emitter.Events

// Create a typed emitter
const emitter = Emitter.of<MyEvents>()

// Register event listeners
const off = emitter.on('progress', ({ percent }) => {
  console.log(`Progress: ${percent}%`)
})

// One-time listeners
emitter.once('complete', ({ result }) => {
  console.log(`Completed with result: ${result}`)
})

// Conditional listeners
emitter.onceIf('progress', _ => _.percent > 50, () => {
  console.log('More than halfway done!')
})

// Promise-based waiting
try {
  const [ { result } ] = await emitter.eventually('complete', 5_000) // 5s timeout
  console.log(`Got result: ${result}`)
} catch (err) {
  console.error('Timed out waiting for completion')
}

// Emit events
emitter.emit('start', { timestamp: Date.now() })
emitter.emit('progress', { percent: 25 })

// Unregister listeners
off()
```

## License

```
MIT License

Copyright 2022 Mirek Rusin

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
