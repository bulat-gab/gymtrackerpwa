<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionsStore } from '@/stores/sessions'
import { dateToISODateString, isToday } from '@/utils/utils'

const router = useRouter()
const store = useSessionsStore()

const currentDate = ref(new Date())
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
})

const firstDayOfMonth = computed(() => {
  // Convert from Sunday-first (0=Sunday) to Monday-first (0=Monday)
  // Formula: (getDay() + 6) % 7
  const dayOfWeek = new Date(currentYear.value, currentMonth.value, 1).getDay()
  return (dayOfWeek + 6) % 7
})

const calendarDays = computed(() => {
  const days: Array<{ day: number; date: string; hasSession: boolean }> = []

  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth.value; i++) {
    days.push({ day: 0, date: '', hasSession: false })
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth.value; day++) {
    const date = new Date(currentYear.value, currentMonth.value, day)
    const dateString = dateToISODateString(date)
    days.push({
      day,
      date: dateString,
      hasSession: store.datesWithSessions.has(dateString),
    })
  }

  return days
})

const previousMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

const goToToday = () => {
  currentDate.value = new Date()
}

const getSessionsForDate = (dateString: string) => {
  return store.sessionsByDate[dateString] || []
}

const handleDateClick = (item: { day: number; date: string; hasSession: boolean }) => {
  if (item.hasSession && item.day > 0) {
    const sessions = getSessionsForDate(item.date)
    const firstSession = sessions[0]
    if (firstSession) {
      // Navigate to the first session's details page
      router.push(`/session/${firstSession.id}`)
    }
  }
}
</script>

<template>
  <div class="calendar-view">
    <header>
      <h1>Calendar</h1>
      <div class="calendar-controls">
        <button @click="previousMonth" class="btn-nav">‹</button>
        <h2>{{ monthNames[currentMonth] }} {{ currentYear }}</h2>
        <button @click="nextMonth" class="btn-nav">›</button>
      </div>
      <button @click="goToToday" class="btn-today">Today</button>
    </header>

    <div class="calendar">
      <div class="calendar-header">
        <div
          v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']"
          :key="day"
          class="day-name"
        >
          {{ day }}
        </div>
      </div>

      <div class="calendar-grid">
        <div
          v-for="(item, index) in calendarDays"
          :key="index"
          class="calendar-day"
          :class="{
            'has-session': item.hasSession,
            today: isToday(item.date),
            empty: item.day === 0,
            clickable: item.hasSession && item.day > 0,
          }"
          @click="handleDateClick(item)"
        >
          <span v-if="item.day > 0" class="day-number">{{ item.day }}</span>
        </div>
      </div>
    </div>

    <div class="legend">
      <div class="legend-item">
        <div class="legend-color has-session"></div>
        <span>Session completed</span>
      </div>
      <div class="legend-item">
        <div class="legend-color today"></div>
        <span>Today</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

header {
  margin-bottom: 2rem;
}

header h1 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.calendar-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.calendar-controls h2 {
  margin: 0;
  font-size: 1.3rem;
  min-width: 200px;
  text-align: center;
}

.btn-nav {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
}

.btn-nav:hover {
  background: var(--color-border);
}

.btn-today {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: 500;
}

.btn-today:hover {
  background: var(--color-primary-hover);
}

.calendar {
  background: var(--color-background-soft);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid var(--color-border);
  margin-bottom: 1.5rem;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.day-name {
  text-align: center;
  font-weight: 600;
  padding: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--color-background);
}

.calendar-day:hover:not(.empty) {
  background: var(--color-background-soft);
}

.calendar-day.clickable:hover {
  opacity: 0.9;
  transform: scale(1.05);
}

.calendar-day.empty {
  border: none;
  cursor: default;
}

.calendar-day.has-session {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.calendar-day.today {
  border: 2px solid var(--color-primary);
  font-weight: 600;
}

.calendar-day.today.has-session {
  border-color: var(--color-primary);
}

.day-number {
  font-size: 1rem;
}

.legend {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
}

.legend-color.has-session {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.legend-color.today {
  border: 2px solid var(--color-primary);
  background: transparent;
}

:root {
  --color-primary: #42b983;
  --color-primary-hover: #35a372;
  --color-text-secondary: #666;
}

@media (max-width: 640px) {
  .calendar-controls h2 {
    font-size: 1.1rem;
    min-width: 150px;
  }

  .day-name {
    font-size: 0.8rem;
    padding: 0.25rem;
  }

  .day-number {
    font-size: 0.9rem;
  }
}
</style>
