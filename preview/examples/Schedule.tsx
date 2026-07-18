// Example template — Schedule / Events. Full-page composition dogfooding A4ui components.
// Theme-agnostic: only semantic tokens/utilities, so it reskins under any theme.
import { Plus } from 'lucide-solid'
import { Show, createMemo, createSignal, type JSX } from 'solid-js'

import {
  Avatar,
  Badge,
  Button,
  Calendar,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Clock,
  Countdown,
  FloatingActionButton,
  List,
  Timeline,
} from '../../src'

type EventType = 'meeting' | 'review' | 'social' | 'focus'

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'
type TimelineTone = 'default' | 'primary' | 'success' | 'danger'

interface ScheduleEvent {
  /** Days offset from today; drives which calendar day this event lands on. */
  dayOffset: number
  /** 24h start hour + minute, used for both the label and the countdown target. */
  hour: number
  minute: number
  title: string
  type: EventType
  organizer: string
}

const TYPE_TONE: Record<EventType, BadgeTone> = {
  meeting: 'info',
  review: 'warning',
  social: 'success',
  focus: 'neutral',
}

const TYPE_DOT: Record<EventType, TimelineTone> = {
  meeting: 'primary',
  review: 'danger',
  social: 'success',
  focus: 'default',
}

const TYPE_LABEL: Record<EventType, string> = {
  meeting: 'Meeting',
  review: 'Review',
  social: 'Social',
  focus: 'Focus',
}

const EVENTS: ScheduleEvent[] = [
  { dayOffset: 0, hour: 9, minute: 30, title: 'Team standup', type: 'meeting', organizer: 'Marina Vega' },
  { dayOffset: 0, hour: 11, minute: 0, title: 'Design review', type: 'review', organizer: 'Theo Nakamura' },
  { dayOffset: 0, hour: 14, minute: 0, title: 'Deep work block', type: 'focus', organizer: 'Priya Anand' },
  { dayOffset: 0, hour: 17, minute: 30, title: 'Happy hour', type: 'social', organizer: 'Lucas Moreau' },
  { dayOffset: 1, hour: 10, minute: 0, title: 'Roadmap sync', type: 'meeting', organizer: 'Sofia Rossi' },
  { dayOffset: 1, hour: 13, minute: 0, title: 'Sprint retro', type: 'review', organizer: 'Marina Vega' },
  {
    dayOffset: 2,
    hour: 9,
    minute: 0,
    title: 'Client onboarding',
    type: 'meeting',
    organizer: 'Theo Nakamura',
  },
  { dayOffset: 2, hour: 15, minute: 30, title: 'Launch rehearsal', type: 'review', organizer: 'Priya Anand' },
  { dayOffset: 3, hour: 12, minute: 0, title: 'Team lunch', type: 'social', organizer: 'Lucas Moreau' },
]

const initials = (name: string): string =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const startOfDay = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate())

const sameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

/** Concrete start moment for an event, anchored to today + its dayOffset. */
const eventDate = (base: Date, ev: ScheduleEvent): Date =>
  new Date(base.getFullYear(), base.getMonth(), base.getDate() + ev.dayOffset, ev.hour, ev.minute)

const timeLabel = (d: Date): string => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

const dayLabel = (d: Date): string =>
  d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })

export default function Schedule(): JSX.Element {
  const today = startOfDay(new Date())
  const [selected, setSelected] = createSignal(today)

  // Events on the currently selected calendar day, sorted by start time.
  const dayEvents = createMemo(() =>
    EVENTS.map((ev) => ({ ev, at: eventDate(today, ev) }))
      .filter(({ at }) => sameDay(at, selected()))
      .sort((a, b) => a.at.getTime() - b.at.getTime()),
  )

  // Soonest upcoming event across the whole schedule — powers the countdown card.
  const nextEvent = createMemo(() => {
    const now = Date.now()
    return EVENTS.map((ev) => ({ ev, at: eventDate(today, ev) }))
      .filter(({ at }) => at.getTime() > now)
      .sort((a, b) => a.at.getTime() - b.at.getTime())[0]
  })

  return (
    <div class="mx-auto max-w-5xl space-y-6 py-8">
      <header class="flex flex-wrap items-start justify-between gap-4">
        <div class="flex flex-col gap-1">
          <h1 class="text-2xl font-bold tracking-tight">Schedule</h1>
          <p class="text-sm text-muted-foreground">
            Pick a day to see its agenda, and keep an eye on what's coming up next.
          </p>
        </div>
        <div class="text-right">
          <Clock hour12 seconds={false} class="text-2xl" />
          <p class="text-xs uppercase tracking-wide text-muted-foreground">Local time</p>
        </div>
      </header>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: calendar + next-event countdown. */}
        <div class="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent class="flex justify-center">
              <Calendar value={selected()} onChange={(d) => setSelected(startOfDay(d))} />
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <CardTitle>Next event</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <Show
                when={nextEvent()}
                fallback={<p class="text-sm text-muted-foreground">Nothing else on the calendar.</p>}
              >
                {(next) => (
                  <>
                    <div class="space-y-1">
                      <p class="font-medium text-foreground">{next().ev.title}</p>
                      <p class="text-sm text-muted-foreground">
                        {dayLabel(next().at)} · {timeLabel(next().at)}
                      </p>
                    </div>
                    <Countdown to={next().at} />
                  </>
                )}
              </Show>
            </CardContent>
          </Card>
        </div>

        {/* Right column: the selected day's agenda. */}
        <Card class="lg:col-span-2">
          <CardHeader>
            <CardTitle>{dayLabel(selected())}</CardTitle>
          </CardHeader>
          <CardContent>
            <Show
              when={dayEvents().length > 0}
              fallback={
                <div class="grid place-items-center gap-3 py-12 text-center">
                  <p class="text-sm text-muted-foreground">No events scheduled for this day.</p>
                  <Button variant="outline">Add one</Button>
                </div>
              }
            >
              <List
                items={dayEvents().map((slot) => ({
                  title: slot.ev.title,
                  description: `Organized by ${slot.ev.organizer}`,
                  avatar: <Avatar fallback={initials(slot.ev.organizer)} />,
                  meta: (
                    <div class="flex items-center gap-2">
                      <Badge tone={TYPE_TONE[slot.ev.type]}>{TYPE_LABEL[slot.ev.type]}</Badge>
                      <span class="tabular-nums">{timeLabel(slot.at)}</span>
                    </div>
                  ),
                }))}
              />

              <div class="mt-6">
                <p class="mb-3 text-sm font-medium text-foreground">Timeline</p>
                <Timeline
                  items={dayEvents().map((slot) => ({
                    title: slot.ev.title,
                    description: `Organized by ${slot.ev.organizer} · ${TYPE_LABEL[slot.ev.type]}`,
                    time: timeLabel(slot.at),
                    tone: TYPE_DOT[slot.ev.type],
                  }))}
                />
              </div>
            </Show>
          </CardContent>
        </Card>
      </div>

      <FloatingActionButton icon={<Plus class="h-6 w-6" />} label="New event" />
    </div>
  )
}
