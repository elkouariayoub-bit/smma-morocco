'use client'

import { useSyncExternalStore } from 'react'

export type Setter<T> = (
  partial:
    | Partial<T>
    | ((state: T) => Partial<T>)
    | T
    | ((state: T) => T),
  replace?: boolean
) => void

export type StateCreator<T> = (set: Setter<T>, get: () => T) => T

export interface StoreApi<T> {
  getState: () => T
  setState: Setter<T>
  subscribe: (listener: () => void) => () => void
}

type UseStore<T> = {
  (): T
  <U>(selector: (state: T) => U): U
} & StoreApi<T>

export function create<T extends object>(initializer: StateCreator<T>): UseStore<T> {
  let state: T
  const listeners = new Set<() => void>()

  const getState = () => state

  const setState: Setter<T> = (partial, replace = false) => {
    const nextState =
      typeof partial === 'function'
        ? (partial as (state: T) => Partial<T> | T)(state)
        : partial

    if (nextState === state || nextState == null) return

    state = replace ? (nextState as T) : { ...state, ...(nextState as Partial<T>) }

    listeners.forEach((listener) => listener())
  }

  const subscribe: StoreApi<T>['subscribe'] = (listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  state = initializer(setState, getState)

  const useStore = (<U>(selector?: (state: T) => U) =>
    useSyncExternalStore(
      subscribe,
      () => (selector ? selector(state) : (state as unknown as U)),
      () => (selector ? selector(state) : (state as unknown as U))
    )) as UseStore<T>

  useStore.getState = getState
  useStore.setState = setState
  useStore.subscribe = subscribe

  return useStore
}
