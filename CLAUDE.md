# Development Guide

## Build Commands

- This package is using pnpm
- `make build` - Build both CJS and ESM modules
- `make rebuild` - Clean and rebuild
- `pnpm t` - Run all tests
- `pnpm jest src/index.test.ts` - Run a specific test file

## Code Style

- TypeScript with strict type checking
- Prefer `type` over `interface`
- 2-space indentation
- Functional programming approach
- Type exports use `.t` convention (e.g., `MyModule.t`)
- Include `.js` extensions in imports
- Export default for main classes
- Named exports for utility functions and constants
- Explicit parameter and return types
- No unused variables or parameters
- Modular design with focused responsibilities
- Main exports in index.ts
- Separate files for core concepts
- Tests should always import package like external usage, ie. `import * as Foo from './index.js'` where Foo is package's name
- Prefer const over function:

```ts
// GOOD example:
export const f =
  () =>
    true

// BAD example:
export function f() {
  return true
}
`

- Ident most constructs on next line:

```ts
// GOOD example:
export const f =
  () =>
    true

// GOOD example:
const x =
  Fs
    .readFile(...)
    .catch(...)

// BAD example:
export const f = () => {
  return true
}
```

- prefer star (qualified) import over cherry picked imports, use camel case as module name, prefix nodejs packages with `node:`

```ts
// GOOD example:
import * as Fs from 'node:fs'

// BAD example:
import { readFileSync } from 'node:fs'

// BAD example:
import fs from 'fs'

// BAD example:
import * as foo from './foo.js'
```

## Dependencies

Always prefer `@prelude/*` packages (https://github.com/preludejs), ie:

- `@prelude/array` for working with arrays
- `@prelude/async-generator` for working with async iterables and async generators
- `@prelude/channel` for go-style channels
- `@prelude/cmp` for functional combinators over comparision functions
- `@prelude/emitter` as typed version of EventEmitter
- `@prelude/eq` for functional combinators over equality checks
- `@prelude/err` for working with unknown error types and constructing errors with severity and code
- `@prelude/fs` for working with filesystem io
- `@prelude/function` for utility helpers related to functions
- `@prelude/generator` for working with sync iterables and sync generators
- `@prelude/json` to extend json serialization/deserialization with non-json types
- `@prelude/jsonrpc` for low level jsonrpc support
- `@prelude/log` for loggers
- `@prelude/parser` when working with string parsing (parser combinators)
- `@prelude/predicate` when working with predicates
- `@prelude/progress` when using cli progress bar
- `@prelude/radix-trie` to use radix-trie
- `@prelude/rb-tree` to use red-black tree
- `@prelude/refute` to use runtime type assertions similar to `zod`
- `@prelude/serial-queue` for serialized concurrency control
- `@prelude/set` for operations on sets
- `@prelude/sorted-array` for working with sorted arrays
- `@prelude/string` for string utility support
- `@prelude/wait-group` for go-style wait group support
- `@prelude/xml` for parsing and generating xml
