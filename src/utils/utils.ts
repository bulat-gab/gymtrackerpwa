/**
 * Converts a Date object to YYYY-MM-DD format
 */
export const dateToISODateString = (date: Date): string => {
  return date.toISOString().split('T')[0] || ''
}

/**
 * Formats an ISO date string to YYYY-MM-DD format
 */
export const formatISODate = (dateString: string): string => {
  return dateString.split('T')[0] || ''
}

/**
 * Formats an ISO datetime string to local datetime format for datetime-local input
 * Returns format: YYYY-MM-DDTHH:mm in local timezone
 */
export const formatDateTime = (dateTimeString: string): string => {
  const date = new Date(dateTimeString)
  // Format as local time for datetime-local input
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Formats an ISO date string to a localized long date format
 * Example: "January 15, 2026"
 */
export const formatDateLong = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Formats an ISO datetime string to localized time format
 * Example: "02:30 PM"
 */
export const formatTime = (timeString: string): string => {
  const date = new Date(timeString)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Calculates duration between start and end time
 * Returns formatted string like "2h 30m" or "45m"
 */
export const getDuration = (startTime: string, endTime?: string): string => {
  if (!endTime) return 'N/A'
  const start = new Date(startTime)
  const end = new Date(endTime)
  const diff = Math.floor((end.getTime() - start.getTime()) / 1000 / 60)
  const hours = Math.floor(diff / 60)
  const minutes = diff % 60
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

/**
 * Gets today's date in YYYY-MM-DD format
 */
export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0] || ''
}

/**
 * Checks if a given date string matches today's date
 */
export const isToday = (dateString: string): boolean => {
  return dateString === getTodayDateString()
}
