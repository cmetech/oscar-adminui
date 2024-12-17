// src/lib/calendar-timeranges.js
import dayjs from 'src/lib/dayjs-config'

// ** Function to round to the nearest 10 minutes
export const roundToNearest10Min = date => {
  const minutes = date.minute()
  const seconds = date.second()

  // Calculate the nearest 10-minute mark
  const rounding = seconds > 30 ? Math.ceil(minutes / 10) * 10 : Math.round(minutes / 10) * 10

  return date.minute(rounding).second(0)
}

// ** Function to round today's date to the nearest 10 minutes
export const todayRounded = () => {
  return roundToNearest10Min(dayjs())
}

export const yesterdayRounded = () => {
  return roundToNearest10Min(dayjs().subtract(1, 'day'))
}

export const roundDownToNearest10Min = date => {
  const minutes = date.minute()
  const roundedMinutes = Math.floor(minutes / 10) * 10

  return date.minute(roundedMinutes).second(0)
}

// ** Export function to get the default date range
export const getDefaultDateRange = timezone => {
  const now = dayjs().tz(timezone)
  const startOfLastHour = now.subtract(1, 'hour')

  return [startOfLastHour, now]
}

// ** Export function to get extended predefined ranges
export const getExtendedPredefinedRangesDayjs = (timezone, t) => {
  return [
    {
      label: t('Last Hour'),
      getValue: () => {
        const now = dayjs().tz(timezone)
        const start = now.subtract(1, 'hour')

        return [start, now]
      }
    },
    {
      label: t('Today'),
      getValue: () => {
        const startOfDay = dayjs().tz(timezone).startOf('day')
        const endOfDay = dayjs().tz(timezone).endOf('day')

        return [startOfDay, endOfDay]
      }
    },
    {
      label: t('Yesterday'),
      getValue: () => {
        const startOfDay = dayjs().tz(timezone).subtract(1, 'day').startOf('day')
        const endOfDay = dayjs().tz(timezone).subtract(1, 'day').endOf('day')

        return [startOfDay, endOfDay]
      }
    },
    {
      label: t('Last 24 Hours'),
      getValue: () => {
        const now = dayjs().tz(timezone)
        const start = now.subtract(24, 'hour')

        return [start, now]
      }
    }
    // ** Add more ranges as needed**
  ]
}
