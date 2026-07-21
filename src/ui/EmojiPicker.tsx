// Compact, dependency-free emoji picker: a small curated dataset lives inline
// (no network fetch, no emoji-data package) so it works offline and stays
// tree-shakeable. Search filters by keyword; category tabs scroll the grid
// (single scroll container, not a tab panel switch) so browsing feels
// continuous. Recents are session-only (a plain signal, no persistence) since
// "last used in this session" is the only guarantee callers should rely on.
import { Dumbbell, Hash, Lightbulb, Leaf, Plane, Search, Smile, Users, Utensils } from 'lucide-solid'
import { createMemo, createSignal, For, Show, type Component, type JSX } from 'solid-js'

import { cn } from '../lib/cn'

type Category = 'Smileys' | 'People' | 'Nature' | 'Food' | 'Activity' | 'Travel' | 'Objects' | 'Symbols'

interface EmojiEntry {
  emoji: string
  keywords: string[]
  category: Category
}

const CATEGORY_ICON: Record<Category, Component<{ class?: string }>> = {
  Smileys: Smile,
  People: Users,
  Nature: Leaf,
  Food: Utensils,
  Activity: Dumbbell,
  Travel: Plane,
  Objects: Lightbulb,
  Symbols: Hash,
}

const CATEGORIES: Category[] = [
  'Smileys',
  'People',
  'Nature',
  'Food',
  'Activity',
  'Travel',
  'Objects',
  'Symbols',
]

// ~150 common emoji, curated across 8 categories. Keywords are lowercase and
// cover the obvious English search terms (name, synonyms, related feelings).
const EMOJI_DATA: EmojiEntry[] = [
  // Smileys
  { emoji: '😀', keywords: ['grin', 'happy', 'smile'], category: 'Smileys' },
  { emoji: '😃', keywords: ['happy', 'joy', 'smile'], category: 'Smileys' },
  { emoji: '😄', keywords: ['happy', 'laugh', 'smile'], category: 'Smileys' },
  { emoji: '😁', keywords: ['grin', 'happy', 'teeth'], category: 'Smileys' },
  { emoji: '😆', keywords: ['laugh', 'lol', 'squint'], category: 'Smileys' },
  { emoji: '😅', keywords: ['sweat', 'laugh', 'relief'], category: 'Smileys' },
  { emoji: '🤣', keywords: ['rofl', 'laugh', 'funny'], category: 'Smileys' },
  { emoji: '😂', keywords: ['tears', 'laugh', 'joy', 'lol'], category: 'Smileys' },
  { emoji: '🙂', keywords: ['smile', 'slight', 'ok'], category: 'Smileys' },
  { emoji: '🙃', keywords: ['upside down', 'silly'], category: 'Smileys' },
  { emoji: '😉', keywords: ['wink', 'flirt'], category: 'Smileys' },
  { emoji: '😊', keywords: ['blush', 'smile', 'happy'], category: 'Smileys' },
  { emoji: '😍', keywords: ['love', 'heart eyes', 'crush'], category: 'Smileys' },
  { emoji: '😘', keywords: ['kiss', 'love'], category: 'Smileys' },
  { emoji: '😋', keywords: ['yum', 'tasty', 'tongue'], category: 'Smileys' },
  { emoji: '😎', keywords: ['cool', 'sunglasses'], category: 'Smileys' },
  { emoji: '🤩', keywords: ['star struck', 'excited', 'wow'], category: 'Smileys' },
  { emoji: '🥳', keywords: ['party', 'celebrate', 'birthday'], category: 'Smileys' },
  { emoji: '😐', keywords: ['neutral', 'meh'], category: 'Smileys' },
  { emoji: '🙄', keywords: ['eyeroll', 'annoyed'], category: 'Smileys' },
  { emoji: '😴', keywords: ['sleep', 'tired', 'zzz'], category: 'Smileys' },
  { emoji: '🤔', keywords: ['think', 'hmm', 'ponder'], category: 'Smileys' },
  { emoji: '😢', keywords: ['sad', 'cry', 'tear'], category: 'Smileys' },
  { emoji: '😭', keywords: ['sob', 'cry', 'sad', 'bawling'], category: 'Smileys' },
  { emoji: '😡', keywords: ['angry', 'mad', 'rage'], category: 'Smileys' },
  { emoji: '🤯', keywords: ['mind blown', 'shocked'], category: 'Smileys' },
  { emoji: '😱', keywords: ['scream', 'shocked', 'scared'], category: 'Smileys' },
  { emoji: '🥺', keywords: ['pleading', 'puppy eyes', 'please'], category: 'Smileys' },
  { emoji: '😇', keywords: ['angel', 'halo', 'innocent'], category: 'Smileys' },
  { emoji: '🤗', keywords: ['hug', 'embrace'], category: 'Smileys' },

  // People
  { emoji: '👋', keywords: ['wave', 'hello', 'bye'], category: 'People' },
  { emoji: '👍', keywords: ['thumbs up', 'like', 'yes', 'ok'], category: 'People' },
  { emoji: '👎', keywords: ['thumbs down', 'dislike', 'no'], category: 'People' },
  { emoji: '👏', keywords: ['clap', 'applause', 'bravo'], category: 'People' },
  { emoji: '🙌', keywords: ['raise hands', 'celebrate', 'praise'], category: 'People' },
  { emoji: '🙏', keywords: ['pray', 'please', 'thanks'], category: 'People' },
  { emoji: '💪', keywords: ['muscle', 'strong', 'flex'], category: 'People' },
  { emoji: '🤝', keywords: ['handshake', 'deal', 'agreement'], category: 'People' },
  { emoji: '✌️', keywords: ['peace', 'victory'], category: 'People' },
  { emoji: '🤞', keywords: ['fingers crossed', 'luck', 'hope'], category: 'People' },
  { emoji: '👌', keywords: ['ok', 'perfect'], category: 'People' },
  { emoji: '👀', keywords: ['eyes', 'look', 'watching'], category: 'People' },
  { emoji: '🧠', keywords: ['brain', 'smart', 'mind'], category: 'People' },
  { emoji: '👶', keywords: ['baby', 'infant'], category: 'People' },
  { emoji: '🧑', keywords: ['person', 'adult'], category: 'People' },
  { emoji: '👨', keywords: ['man'], category: 'People' },
  { emoji: '👩', keywords: ['woman'], category: 'People' },
  { emoji: '🧓', keywords: ['older person', 'elder'], category: 'People' },
  { emoji: '👴', keywords: ['old man', 'grandpa'], category: 'People' },
  { emoji: '👵', keywords: ['old woman', 'grandma'], category: 'People' },
  { emoji: '👮', keywords: ['police', 'officer', 'cop'], category: 'People' },
  { emoji: '🧑‍💻', keywords: ['coder', 'developer', 'programmer'], category: 'People' },
  { emoji: '🧑‍🎓', keywords: ['student', 'graduate'], category: 'People' },
  { emoji: '🧑‍🍳', keywords: ['chef', 'cook'], category: 'People' },
  { emoji: '👨‍👩‍👧', keywords: ['family'], category: 'People' },

  // Nature
  { emoji: '🐶', keywords: ['dog', 'puppy'], category: 'Nature' },
  { emoji: '🐱', keywords: ['cat', 'kitten'], category: 'Nature' },
  { emoji: '🐭', keywords: ['mouse'], category: 'Nature' },
  { emoji: '🐰', keywords: ['rabbit', 'bunny'], category: 'Nature' },
  { emoji: '🦊', keywords: ['fox'], category: 'Nature' },
  { emoji: '🐻', keywords: ['bear'], category: 'Nature' },
  { emoji: '🐼', keywords: ['panda'], category: 'Nature' },
  { emoji: '🦁', keywords: ['lion'], category: 'Nature' },
  { emoji: '🐸', keywords: ['frog'], category: 'Nature' },
  { emoji: '🐵', keywords: ['monkey'], category: 'Nature' },
  { emoji: '🐔', keywords: ['chicken'], category: 'Nature' },
  { emoji: '🐧', keywords: ['penguin'], category: 'Nature' },
  { emoji: '🐦', keywords: ['bird'], category: 'Nature' },
  { emoji: '🦋', keywords: ['butterfly'], category: 'Nature' },
  { emoji: '🐝', keywords: ['bee', 'insect'], category: 'Nature' },
  { emoji: '🐢', keywords: ['turtle'], category: 'Nature' },
  { emoji: '🐬', keywords: ['dolphin'], category: 'Nature' },
  { emoji: '🐳', keywords: ['whale'], category: 'Nature' },
  { emoji: '🦄', keywords: ['unicorn'], category: 'Nature' },
  { emoji: '🌵', keywords: ['cactus', 'plant'], category: 'Nature' },
  { emoji: '🌲', keywords: ['tree', 'evergreen'], category: 'Nature' },
  { emoji: '🌴', keywords: ['palm tree'], category: 'Nature' },
  { emoji: '🌸', keywords: ['blossom', 'flower', 'cherry'], category: 'Nature' },
  { emoji: '🌻', keywords: ['sunflower', 'flower'], category: 'Nature' },
  { emoji: '🌈', keywords: ['rainbow'], category: 'Nature' },
  { emoji: '☀️', keywords: ['sun', 'sunny'], category: 'Nature' },
  { emoji: '⭐', keywords: ['star'], category: 'Nature' },
  { emoji: '🔥', keywords: ['fire', 'hot', 'lit'], category: 'Nature' },
  { emoji: '🌊', keywords: ['wave', 'ocean', 'water'], category: 'Nature' },
  { emoji: '❄️', keywords: ['snowflake', 'snow', 'cold'], category: 'Nature' },

  // Food
  { emoji: '🍎', keywords: ['apple', 'fruit'], category: 'Food' },
  { emoji: '🍌', keywords: ['banana', 'fruit'], category: 'Food' },
  { emoji: '🍇', keywords: ['grapes', 'fruit'], category: 'Food' },
  { emoji: '🍓', keywords: ['strawberry', 'fruit'], category: 'Food' },
  { emoji: '🍉', keywords: ['watermelon', 'fruit'], category: 'Food' },
  { emoji: '🍕', keywords: ['pizza'], category: 'Food' },
  { emoji: '🍔', keywords: ['burger', 'hamburger'], category: 'Food' },
  { emoji: '🍟', keywords: ['fries', 'french fries'], category: 'Food' },
  { emoji: '🌭', keywords: ['hot dog'], category: 'Food' },
  { emoji: '🌮', keywords: ['taco'], category: 'Food' },
  { emoji: '🍣', keywords: ['sushi'], category: 'Food' },
  { emoji: '🍜', keywords: ['noodles', 'ramen', 'soup'], category: 'Food' },
  { emoji: '🍝', keywords: ['pasta', 'spaghetti'], category: 'Food' },
  { emoji: '🍞', keywords: ['bread'], category: 'Food' },
  { emoji: '🥐', keywords: ['croissant'], category: 'Food' },
  { emoji: '🧀', keywords: ['cheese'], category: 'Food' },
  { emoji: '🍗', keywords: ['chicken leg', 'meat'], category: 'Food' },
  { emoji: '🍩', keywords: ['donut', 'doughnut'], category: 'Food' },
  { emoji: '🍪', keywords: ['cookie'], category: 'Food' },
  { emoji: '🎂', keywords: ['cake', 'birthday'], category: 'Food' },
  { emoji: '🍰', keywords: ['cake', 'slice'], category: 'Food' },
  { emoji: '🍫', keywords: ['chocolate'], category: 'Food' },
  { emoji: '🍿', keywords: ['popcorn'], category: 'Food' },
  { emoji: '☕', keywords: ['coffee', 'hot drink'], category: 'Food' },
  { emoji: '🍵', keywords: ['tea'], category: 'Food' },
  { emoji: '🍺', keywords: ['beer'], category: 'Food' },
  { emoji: '🍷', keywords: ['wine'], category: 'Food' },
  { emoji: '🥤', keywords: ['drink', 'soda', 'cup'], category: 'Food' },

  // Activity
  { emoji: '⚽', keywords: ['soccer', 'football'], category: 'Activity' },
  { emoji: '🏀', keywords: ['basketball'], category: 'Activity' },
  { emoji: '🏈', keywords: ['american football'], category: 'Activity' },
  { emoji: '⚾', keywords: ['baseball'], category: 'Activity' },
  { emoji: '🎾', keywords: ['tennis'], category: 'Activity' },
  { emoji: '🏐', keywords: ['volleyball'], category: 'Activity' },
  { emoji: '🏓', keywords: ['ping pong', 'table tennis'], category: 'Activity' },
  { emoji: '🏸', keywords: ['badminton'], category: 'Activity' },
  { emoji: '🥊', keywords: ['boxing', 'glove'], category: 'Activity' },
  { emoji: '🏋️', keywords: ['weightlifting', 'gym', 'workout'], category: 'Activity' },
  { emoji: '🚴', keywords: ['cycling', 'bike'], category: 'Activity' },
  { emoji: '🏊', keywords: ['swimming'], category: 'Activity' },
  { emoji: '🧗', keywords: ['climbing'], category: 'Activity' },
  { emoji: '🏆', keywords: ['trophy', 'win', 'award'], category: 'Activity' },
  { emoji: '🥇', keywords: ['gold medal', 'first place'], category: 'Activity' },
  { emoji: '🎮', keywords: ['video game', 'controller', 'gaming'], category: 'Activity' },
  { emoji: '🎲', keywords: ['dice', 'game'], category: 'Activity' },
  { emoji: '🎯', keywords: ['target', 'dart', 'goal'], category: 'Activity' },
  { emoji: '🎨', keywords: ['art', 'palette', 'paint'], category: 'Activity' },
  { emoji: '🎸', keywords: ['guitar', 'music'], category: 'Activity' },
  { emoji: '🎧', keywords: ['headphones', 'music'], category: 'Activity' },
  { emoji: '🎤', keywords: ['microphone', 'sing', 'karaoke'], category: 'Activity' },

  // Travel
  { emoji: '🚗', keywords: ['car', 'drive'], category: 'Travel' },
  { emoji: '🚕', keywords: ['taxi', 'cab'], category: 'Travel' },
  { emoji: '🚌', keywords: ['bus'], category: 'Travel' },
  { emoji: '🚓', keywords: ['police car'], category: 'Travel' },
  { emoji: '🚑', keywords: ['ambulance'], category: 'Travel' },
  { emoji: '🚲', keywords: ['bike', 'bicycle'], category: 'Travel' },
  { emoji: '🏍️', keywords: ['motorcycle'], category: 'Travel' },
  { emoji: '✈️', keywords: ['airplane', 'flight', 'travel'], category: 'Travel' },
  { emoji: '🚀', keywords: ['rocket', 'launch', 'space'], category: 'Travel' },
  { emoji: '🚁', keywords: ['helicopter'], category: 'Travel' },
  { emoji: '🚢', keywords: ['ship', 'boat', 'cruise'], category: 'Travel' },
  { emoji: '⛵', keywords: ['sailboat', 'boat'], category: 'Travel' },
  { emoji: '🚆', keywords: ['train'], category: 'Travel' },
  { emoji: '🚇', keywords: ['subway', 'metro'], category: 'Travel' },
  { emoji: '🗽', keywords: ['statue of liberty', 'landmark'], category: 'Travel' },
  { emoji: '🗼', keywords: ['tower', 'landmark'], category: 'Travel' },
  { emoji: '🏝️', keywords: ['island', 'beach', 'vacation'], category: 'Travel' },
  { emoji: '🏖️', keywords: ['beach', 'vacation'], category: 'Travel' },
  { emoji: '🏔️', keywords: ['mountain', 'snow'], category: 'Travel' },
  { emoji: '🗺️', keywords: ['map', 'travel'], category: 'Travel' },
  { emoji: '🧳', keywords: ['luggage', 'suitcase', 'packing'], category: 'Travel' },
  { emoji: '🏨', keywords: ['hotel'], category: 'Travel' },
  { emoji: '⛺', keywords: ['tent', 'camping'], category: 'Travel' },

  // Objects
  { emoji: '💡', keywords: ['idea', 'lightbulb', 'bulb'], category: 'Objects' },
  { emoji: '📱', keywords: ['phone', 'mobile', 'smartphone'], category: 'Objects' },
  { emoji: '💻', keywords: ['laptop', 'computer'], category: 'Objects' },
  { emoji: '⌚', keywords: ['watch', 'clock'], category: 'Objects' },
  { emoji: '📷', keywords: ['camera', 'photo'], category: 'Objects' },
  { emoji: '🎁', keywords: ['gift', 'present'], category: 'Objects' },
  { emoji: '📚', keywords: ['books', 'read', 'study'], category: 'Objects' },
  { emoji: '✏️', keywords: ['pencil', 'write'], category: 'Objects' },
  { emoji: '📝', keywords: ['note', 'memo', 'write'], category: 'Objects' },
  { emoji: '📌', keywords: ['pin', 'pushpin'], category: 'Objects' },
  { emoji: '🔒', keywords: ['lock', 'secure', 'private'], category: 'Objects' },
  { emoji: '🔑', keywords: ['key', 'unlock'], category: 'Objects' },
  { emoji: '🔨', keywords: ['hammer', 'tool', 'build'], category: 'Objects' },
  { emoji: '💰', keywords: ['money', 'bag', 'cash'], category: 'Objects' },
  { emoji: '💳', keywords: ['credit card', 'payment'], category: 'Objects' },
  { emoji: '📦', keywords: ['box', 'package', 'delivery'], category: 'Objects' },
  { emoji: '📅', keywords: ['calendar', 'date'], category: 'Objects' },
  { emoji: '⏰', keywords: ['alarm', 'clock', 'time'], category: 'Objects' },
  { emoji: '🔔', keywords: ['bell', 'notification', 'alert'], category: 'Objects' },
  { emoji: '🎵', keywords: ['music', 'note'], category: 'Objects' },

  // Symbols
  { emoji: '❤️', keywords: ['heart', 'love', 'red'], category: 'Symbols' },
  { emoji: '💔', keywords: ['broken heart', 'sad'], category: 'Symbols' },
  { emoji: '💯', keywords: ['hundred', 'perfect', 'score'], category: 'Symbols' },
  { emoji: '✅', keywords: ['check', 'done', 'yes', 'correct'], category: 'Symbols' },
  { emoji: '❌', keywords: ['cross', 'no', 'wrong', 'cancel'], category: 'Symbols' },
  { emoji: '⚠️', keywords: ['warning', 'caution', 'alert'], category: 'Symbols' },
  { emoji: '❓', keywords: ['question', 'ask'], category: 'Symbols' },
  { emoji: '❗', keywords: ['exclamation', 'important'], category: 'Symbols' },
  { emoji: '♻️', keywords: ['recycle', 'reuse'], category: 'Symbols' },
  { emoji: '⚡', keywords: ['lightning', 'bolt', 'fast', 'power'], category: 'Symbols' },
  { emoji: '✨', keywords: ['sparkles', 'shiny', 'magic'], category: 'Symbols' },
  { emoji: '🎉', keywords: ['party', 'celebrate', 'tada'], category: 'Symbols' },
  { emoji: '🔁', keywords: ['repeat', 'loop', 'refresh'], category: 'Symbols' },
  { emoji: '🔀', keywords: ['shuffle', 'random'], category: 'Symbols' },
  { emoji: '➕', keywords: ['plus', 'add'], category: 'Symbols' },
  { emoji: '➖', keywords: ['minus', 'subtract'], category: 'Symbols' },
  { emoji: '🆗', keywords: ['ok', 'okay'], category: 'Symbols' },
  { emoji: '🔴', keywords: ['red circle', 'stop', 'live'], category: 'Symbols' },
  { emoji: '🟢', keywords: ['green circle', 'go', 'online'], category: 'Symbols' },
]

const MAX_RECENTS = 16

export interface EmojiPickerProps {
  /** Called with the emoji character whenever the user picks one. */
  onSelect: (emoji: string) => void
  class?: string
}

/**
 * A searchable emoji grid with an inline curated dataset (no network fetch),
 * category tabs that scroll to their section, and a session-only "Recents"
 * row. Type in the search box to filter by keyword, or click a category icon
 * to jump the grid to that section.
 *
 * @example
 * ```tsx
 * <EmojiPicker onSelect={(emoji) => insertAtCursor(emoji)} />
 * ```
 */
export function EmojiPicker(props: EmojiPickerProps): JSX.Element {
  const [query, setQuery] = createSignal('')
  const [recents, setRecents] = createSignal<string[]>([])

  const sectionRefs = new Map<Category, HTMLDivElement>()
  let scrollRoot!: HTMLDivElement

  const filtered = createMemo<EmojiEntry[]>(() => {
    const q = query().trim().toLowerCase()
    if (!q) return EMOJI_DATA
    return EMOJI_DATA.filter(
      (entry) => entry.emoji === q || entry.keywords.some((keyword) => keyword.includes(q)),
    )
  })

  const grouped = createMemo<Array<[Category, EmojiEntry[]]>>(() => {
    const byCategory = new Map<Category, EmojiEntry[]>()
    for (const entry of filtered()) {
      const list = byCategory.get(entry.category)
      if (list) list.push(entry)
      else byCategory.set(entry.category, [entry])
    }
    return CATEGORIES.filter((category) => byCategory.has(category)).map(
      (category) => [category, byCategory.get(category) ?? []] as [Category, EmojiEntry[]],
    )
  })

  const jumpTo = (category: Category): void => {
    sectionRefs.get(category)?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }

  const pick = (emoji: string): void => {
    setRecents((prev) => [emoji, ...prev.filter((item) => item !== emoji)].slice(0, MAX_RECENTS))
    props.onSelect(emoji)
  }

  const onGridKeyDown = (event: KeyboardEvent): void => {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
    const target = event.target as HTMLElement
    if (target.tagName !== 'BUTTON') return
    const buttons = Array.from(scrollRoot.querySelectorAll<HTMLButtonElement>('button[data-emoji-cell]'))
    const index = buttons.indexOf(target as HTMLButtonElement)
    if (index === -1) return
    const columns = 8
    const delta =
      event.key === 'ArrowRight'
        ? 1
        : event.key === 'ArrowLeft'
          ? -1
          : event.key === 'ArrowDown'
            ? columns
            : -columns
    const next = buttons[index + delta]
    if (next) {
      event.preventDefault()
      next.focus()
    }
  }

  return (
    <div
      class={cn('flex w-full max-w-sm flex-col overflow-hidden rounded-md border border-border', props.class)}
    >
      <div class="flex items-center gap-2 border-b border-border bg-background p-2">
        <Search class="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          type="text"
          value={query()}
          onInput={(ev) => setQuery(ev.currentTarget.value)}
          placeholder="Search emoji…"
          aria-label="Search emoji"
          class="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div class="flex items-center gap-1 overflow-x-auto border-b border-border bg-background px-2 py-1.5">
        <For each={CATEGORIES}>
          {(category) => {
            const Icon = CATEGORY_ICON[category]
            return (
              <button
                type="button"
                onClick={() => jumpTo(category)}
                aria-label={category}
                title={category}
                class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <Icon class="h-4 w-4" />
              </button>
            )
          }}
        </For>
      </div>

      <div ref={scrollRoot} onKeyDown={onGridKeyDown} class="max-h-72 overflow-y-auto p-2">
        <Show when={recents().length > 0 && !query()}>
          <div class="mb-2">
            <p class="mb-1 px-1 text-xs font-medium text-muted-foreground">Recents</p>
            <div class="grid grid-cols-8 gap-0.5">
              <For each={recents()}>
                {(emoji) => (
                  <button
                    type="button"
                    data-emoji-cell
                    onClick={() => pick(emoji)}
                    aria-label={emoji}
                    class="flex h-8 w-8 items-center justify-center rounded-md text-lg leading-none transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {emoji}
                  </button>
                )}
              </For>
            </div>
          </div>
        </Show>

        <Show when={grouped().length === 0}>
          <p class="px-1 py-6 text-center text-sm text-muted-foreground">No emoji found.</p>
        </Show>

        <For each={grouped()}>
          {([category, entries]) => (
            <div ref={(el) => sectionRefs.set(category, el)} class="mb-2">
              <p class="mb-1 px-1 text-xs font-medium text-muted-foreground">{category}</p>
              <div class="grid grid-cols-8 gap-0.5">
                <For each={entries}>
                  {(entry) => (
                    <button
                      type="button"
                      data-emoji-cell
                      onClick={() => pick(entry.emoji)}
                      aria-label={entry.keywords[0] ?? entry.emoji}
                      title={entry.keywords[0] ?? entry.emoji}
                      class="flex h-8 w-8 items-center justify-center rounded-md text-lg leading-none transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {entry.emoji}
                    </button>
                  )}
                </For>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
