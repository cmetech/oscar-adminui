import {
  parseISO,
  formatDistance,
  subDays,
  startOfWeek,
  endOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  addMonths,
  endOfDay,
  startOfDay,
  subHours,
  getTime,
  fromUnixTime,
  formatRFC3339
} from 'date-fns'

import { format, zonedTimeToUtc, utcToZonedTime, formatInTimeZone } from 'date-fns-tz'

export const predefinedRanges = [
  {
    label: 'Today',
    value: [new Date(), new Date()],
    placement: 'left'
  },
  {
    label: 'Last 24hrs',
    value: [subHours(new Date(), 23), new Date()],
    placement: 'left'
  },
  {
    label: 'Yesterday',
    value: [addDays(startOfDay(new Date(), {}), -1), addDays(endOfDay(new Date(), {}), -1)],
    placement: 'left'
  },
  {
    label: 'This week',
    value: [startOfWeek(new Date()), endOfWeek(new Date())],
    placement: 'left'
  },
  {
    label: 'Last 7 days',
    value: [subDays(new Date(), 6), new Date()],
    placement: 'left'
  },
  {
    label: 'Last 2 weeks',
    value: [subDays(new Date(), 13), new Date()],
    placement: 'left'
  },
  {
    label: 'Yesterday',
    closeOverlay: false,
    value: value => {
      const [start = new Date()] = value || []

      return [addDays(startOfDay(start, {}), -1), addDays(endOfDay(start, {}), -1)]
    },
    appearance: 'default'
  },
  {
    label: 'Last week',
    closeOverlay: false,
    value: value => {
      const [start = new Date()] = value || []

      return [addDays(startOfWeek(start, { weekStartsOn: 0 }), -7), addDays(endOfWeek(start, { weekStartsOn: 0 }), -7)]
    },
    appearance: 'default'
  }
]
