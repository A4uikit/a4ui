// Nested AND/OR rule builder — renders a QueryGroup tree recursively.
import { Plus, Trash2 } from 'lucide-solid'
import type { JSX } from 'solid-js'
import { createMemo, createSignal, For, Show } from 'solid-js'

import { cn } from '../lib/cn'
import { Button } from './Button'
import { Input } from './Input'
import { Select } from './Select'

/** A field the query builder can filter on. */
export interface QueryField {
  /** Value stored in a rule's `field`; must be unique across `fields`. */
  name: string
  /** Label shown in the field `<Select>`. */
  label: string
  /** Determines which operators are offered and how the value is entered. Defaults to `'text'`. */
  type?: 'text' | 'number' | 'select'
  /** Options for the value `<Select>` when `type` is `'select'`. */
  options?: string[]
}

/** A single leaf condition: `field operator value`. */
export type QueryRule = { field: string; operator: string; value: string }

/** A group of rules and/or nested groups, combined with `and`/`or`. */
export type QueryGroup = { combinator: 'and' | 'or'; rules: (QueryRule | QueryGroup)[] }

export interface QueryBuilderProps {
  /** Fields available to filter on; drives the per-field operator and value-input set. */
  fields: QueryField[]
  /** Controlled tree. Omit to manage state internally, seeded with one empty rule. */
  value?: QueryGroup
  /** Called with the full, updated tree on every edit. */
  onChange?: (group: QueryGroup) => void
  class?: string
}

const OPERATORS: Record<NonNullable<QueryField['type']>, string[]> = {
  text: ['is', 'contains', 'starts with'],
  number: ['=', '>', '<', 'between'],
  select: ['is', 'is not'],
}

function isGroup(node: QueryRule | QueryGroup): node is QueryGroup {
  return 'combinator' in node
}

function emptyRule(fields: QueryField[]): QueryRule {
  const field = fields[0]
  const type = field?.type ?? 'text'
  return { field: field?.name ?? '', operator: OPERATORS[type][0], value: '' }
}

function emptyGroup(fields: QueryField[]): QueryGroup {
  return { combinator: 'and', rules: [emptyRule(fields)] }
}

/**
 * Nested AND/OR rule builder: each group has a combinator toggle plus "+ Rule"
 * / "+ Group" buttons, and rules/groups can be removed individually. Groups
 * nest recursively, indented with a left border. Controlled via `value` +
 * `onChange`, or uncontrolled (seeded with one empty rule) when `value` is
 * omitted.
 *
 * @example
 * ```tsx
 * const [query, setQuery] = createSignal<QueryGroup>({
 *   combinator: 'and',
 *   rules: [{ field: 'status', operator: 'is', value: 'open' }],
 * })
 * <QueryBuilder
 *   fields={[
 *     { name: 'status', label: 'Status', type: 'select', options: ['open', 'closed'] },
 *     { name: 'age', label: 'Age', type: 'number' },
 *   ]}
 *   value={query()}
 *   onChange={setQuery}
 * />
 * ```
 */
export function QueryBuilder(props: QueryBuilderProps): JSX.Element {
  const [internal, setInternal] = createSignal<QueryGroup>(props.value ?? emptyGroup(props.fields))

  const group = createMemo(() => props.value ?? internal())

  const emit = (next: QueryGroup): void => {
    if (props.value === undefined) setInternal(next)
    props.onChange?.(next)
  }

  const fieldByName = (name: string): QueryField | undefined => props.fields.find((f) => f.name === name)

  const operatorsFor = (fieldName: string): string[] => OPERATORS[fieldByName(fieldName)?.type ?? 'text']

  return (
    <GroupView
      group={group()}
      fields={props.fields}
      operatorsFor={operatorsFor}
      fieldByName={fieldByName}
      onChange={emit}
      depth={0}
      onRemove={undefined}
    />
  )
}

interface GroupViewProps {
  group: QueryGroup
  fields: QueryField[]
  operatorsFor: (fieldName: string) => string[]
  fieldByName: (name: string) => QueryField | undefined
  onChange: (next: QueryGroup) => void
  depth: number
  /** Absent for the root group, which cannot remove itself. */
  onRemove: (() => void) | undefined
}

function GroupView(props: GroupViewProps): JSX.Element {
  const updateNode = (index: number, next: QueryRule | QueryGroup): void => {
    const rules = props.group.rules.slice()
    rules[index] = next
    props.onChange({ ...props.group, rules })
  }

  const removeNode = (index: number): void => {
    const rules = props.group.rules.slice()
    rules.splice(index, 1)
    props.onChange({ ...props.group, rules })
  }

  const addRule = (): void => {
    props.onChange({ ...props.group, rules: [...props.group.rules, emptyRule(props.fields)] })
  }

  const addGroup = (): void => {
    props.onChange({ ...props.group, rules: [...props.group.rules, emptyGroup(props.fields)] })
  }

  const setCombinator = (combinator: 'and' | 'or'): void => {
    props.onChange({ ...props.group, combinator })
  }

  return (
    <div class={cn('flex flex-col gap-2 rounded-md p-2', props.depth > 0 && 'border-l-2 border-border pl-3')}>
      <div class="flex flex-wrap items-center gap-2">
        <div
          class="inline-flex overflow-hidden rounded-md border border-input"
          role="group"
          aria-label="Combinator"
        >
          <For each={['and', 'or'] as const}>
            {(c) => (
              <button
                type="button"
                class={cn(
                  'px-2 py-1 text-xs font-semibold uppercase transition-colors',
                  props.group.combinator === c
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:bg-muted',
                )}
                aria-pressed={props.group.combinator === c}
                onClick={() => setCombinator(c)}
              >
                {c}
              </button>
            )}
          </For>
        </div>
        <Button variant="outline" onClick={addRule}>
          <Plus class="mr-1 h-3.5 w-3.5" aria-hidden="true" />
          Rule
        </Button>
        <Button variant="outline" onClick={addGroup}>
          <Plus class="mr-1 h-3.5 w-3.5" aria-hidden="true" />
          Group
        </Button>
        <Show when={props.onRemove}>
          {(remove) => (
            <button
              type="button"
              class="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Remove group"
              onClick={() => remove()()}
            >
              <Trash2 class="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </Show>
      </div>

      <For each={props.group.rules}>
        {(node, index) => (
          <Show
            when={isGroup(node)}
            fallback={
              <RuleRow
                rule={node as QueryRule}
                fields={props.fields}
                operatorsFor={props.operatorsFor}
                fieldByName={props.fieldByName}
                onChange={(next) => updateNode(index(), next)}
                onRemove={() => removeNode(index())}
              />
            }
          >
            <GroupView
              group={node as QueryGroup}
              fields={props.fields}
              operatorsFor={props.operatorsFor}
              fieldByName={props.fieldByName}
              onChange={(next) => updateNode(index(), next)}
              depth={props.depth + 1}
              onRemove={() => removeNode(index())}
            />
          </Show>
        )}
      </For>
    </div>
  )
}

interface RuleRowProps {
  rule: QueryRule
  fields: QueryField[]
  operatorsFor: (fieldName: string) => string[]
  fieldByName: (name: string) => QueryField | undefined
  onChange: (next: QueryRule) => void
  onRemove: () => void
}

function RuleRow(props: RuleRowProps): JSX.Element {
  const field = createMemo(() => props.fieldByName(props.rule.field))

  const setField = (name: string): void => {
    const operators = props.operatorsFor(name)
    props.onChange({ field: name, operator: operators[0], value: '' })
  }

  const setOperator = (operator: string): void => props.onChange({ ...props.rule, operator })
  const setValue = (value: string): void => props.onChange({ ...props.rule, value })

  return (
    <div class="flex flex-wrap items-center gap-2">
      <Select class="w-40" value={props.rule.field} onChange={setField} aria-label="Field">
        <For each={props.fields}>{(f) => <option value={f.name}>{f.label}</option>}</For>
      </Select>
      <Select class="w-32" value={props.rule.operator} onChange={setOperator} aria-label="Operator">
        <For each={props.operatorsFor(props.rule.field)}>{(op) => <option value={op}>{op}</option>}</For>
      </Select>
      <Show
        when={field()?.type === 'select'}
        fallback={
          <Input
            class="w-40"
            type={field()?.type === 'number' ? 'number' : 'text'}
            value={props.rule.value}
            onInput={setValue}
            aria-label="Value"
          />
        }
      >
        <Select class="w-40" value={props.rule.value} onChange={setValue} aria-label="Value">
          <option value="" disabled>
            Select…
          </option>
          <For each={field()?.options ?? []}>{(opt) => <option value={opt}>{opt}</option>}</For>
        </Select>
      </Show>
      <button
        type="button"
        class="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Remove rule"
        onClick={props.onRemove}
      >
        <Trash2 class="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}
