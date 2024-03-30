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

import dayjs from 'dayjs'

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

export const predefinedRangesDayjs = [
  {
    label: 'Today',
    getValue: () => {
      // (January 1)
      const startOfDay = dayjs().startOf('day')
      const endOfDay = dayjs().endOf('day')

      return [startOfDay, endOfDay]
    }
  },
  {
    label: 'Last 24hrs',
    getValue: () => {
      // (January 1)
      const startOfDay = dayjs().subtract(1, 'day').startOf('day')
      const endOfDay = dayjs().endOf('day')

      return [startOfDay, endOfDay]
    }
  },
  {
    label: 'Yesterday',
    getValue: () => {
      // (January 1)
      const startOfDay = dayjs().subtract(1, 'day').startOf('day')
      const endOfDay = dayjs().subtract(1, 'day').endOf('day')

      return [startOfDay, endOfDay]
    }
  },
  {
    label: 'This week',
    getValue: () => {
      const startOfWeek = dayjs().startOf('week')
      const endOfWeek = dayjs().endOf('week')

      return [startOfWeek, endOfWeek]
    }
  },
  {
    label: 'Last 7 days',
    getValue: () => {
      const startOfLastWeek = dayjs().subtract(7, 'day')
      const endOfLastWeek = dayjs()

      return [startOfLastWeek, endOfLastWeek]
    }
  }
]

const getMonthWeekday = (monthIndex, weekdayIndex, dayRank) => {
  // Helper to find the nth weekday in a given month.
  // For example, Find the 3rd Monday in January.
  const today = dayjs()
  const firstDayOfMonth = today.month(monthIndex).startOf('month')
  const weekDay = firstDayOfMonth.day() // 0 (Sunday) to 6 (Saturday)

  const deltaToFirstValidWeekDayInMonth = (weekDay > weekdayIndex ? 7 : 0) + weekdayIndex - weekDay

  return firstDayOfMonth.add((dayRank - 1) * 7 + deltaToFirstValidWeekDayInMonth, 'day')
}
