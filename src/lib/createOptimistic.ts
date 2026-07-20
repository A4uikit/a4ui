// Optimistic-update helper: show a value immediately, then reconcile with the
// real async result. On failure, rolls back to the previous settled value and
// rethrows so callers still see the error (e.g. to show a toast).
import { createSignal } from 'solid-js'

/**
 * Holds an optimistic value that's updated immediately on `run`, then
 * reconciled with the resolved (or rolled back on rejected) async result.
 *
 * @example
 * ```ts
 * const list = createOptimistic<Todo[]>([])
 * async function addTodo(todo: Todo) {
 *   await list.run([...list.value(), todo], () => api.addTodo(todo))
 * }
 * ```
 */
export function createOptimistic<T>(initial: T): {
  value: () => T
  pending: () => boolean
  run: (optimistic: T, commit: () => Promise<T>) => Promise<T>
} {
  const [value, setValue] = createSignal(initial)
  const [pending, setPending] = createSignal(false)

  async function run(optimistic: T, commit: () => Promise<T>): Promise<T> {
    const previous = value()
    setValue(() => optimistic)
    setPending(true)
    try {
      const resolved = await commit()
      setValue(() => resolved)
      return resolved
    } catch (err) {
      setValue(() => previous)
      throw err
    } finally {
      setPending(false)
    }
  }

  return { value, pending, run }
}
