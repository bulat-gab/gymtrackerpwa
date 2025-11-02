<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const showNav = computed(() => route.name !== 'active-session')
</script>

<template>
  <div id="app">
    <nav v-if="showNav" class="main-nav">
      <RouterLink to="/" class="nav-link" :class="{ active: route.name === 'home' }">
        Home
      </RouterLink>
      <RouterLink
        to="/sessions"
        class="nav-link"
        :class="{ active: route.name === 'sessions-list' }"
      >
        Sessions
      </RouterLink>
      <RouterLink to="/calendar" class="nav-link" :class="{ active: route.name === 'calendar' }">
        Calendar
      </RouterLink>
    </nav>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-nav {
  display: flex;
  justify-content: center;
  gap: 0;
  background: var(--color-background-soft);
  border-bottom: 1px solid var(--color-border);
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.9);
}

.nav-link {
  padding: 1rem 1.5rem;
  text-decoration: none;
  color: var(--color-text);
  font-weight: 500;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.nav-link:hover {
  background: var(--color-background);
}

.nav-link.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

main {
  flex: 1;
  padding-bottom: 2rem;
}

@media (max-width: 640px) {
  .nav-link {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
