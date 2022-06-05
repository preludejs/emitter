/* eslint-disable @typescript-eslint/no-explicit-any no-dupe-class-members */

import { EventEmitter } from 'events'

export type Listener = (...args: any[]) => any

export type Listeners<T> = {
  [U in keyof T]: Listener
}

export type UntypedListeners = {
  [event: string]: Listener
}

export declare class TypedEmitter<T extends Listeners<T> = UntypedListeners> {
  constructor(...args: ConstructorParameters<typeof EventEmitter>)
  static defaultMaxListeners: number
  addListener<U extends keyof T>(event: U, listener: T[U]): this
  emit<U extends keyof T>(event: U, ...args: Parameters<T[U]>): boolean
  eventNames<U extends keyof T>(): U[]
  getMaxListeners(): number
  listenerCount(type: keyof T): number
  listeners<U extends keyof T>(type: U): T[U][]
  off<U extends keyof T>(event: U, listener: T[U]): this
  on(event: 'newListener', listener: (event: keyof T, listener: Listener) => void): this
  on(event: 'removeListener', listener: (event: keyof T, listener: Listener) => void): this
  on<U extends keyof T>(event: U, listener: T[U]): this
  once<U extends keyof T>(event: U, listener: T[U]): this
  prependListener<U extends keyof T>(event: U, listener: T[U]): this
  prependOnceListener<U extends keyof T>(event: U, listener: T[U]): this
  rawListeners<U extends keyof T>(type: U): T[U][]
  removeAllListeners(event?: keyof T): this
  removeListener<U extends keyof T>(event: U, listener: T[U]): this
  setMaxListeners(n: number): this
}

export default EventEmitter as unknown as typeof TypedEmitter
