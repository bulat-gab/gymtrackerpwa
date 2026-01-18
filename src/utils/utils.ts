/**
 * Formats an ISO date string to YYYY-MM-DD format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toISOString().split('T')[0] || ''
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
