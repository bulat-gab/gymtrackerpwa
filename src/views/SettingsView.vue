<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// Get git commit information from build-time constants
const gitCommitHash = __GIT_COMMIT_HASH__
const gitCommitMessage = __GIT_COMMIT_MESSAGE__
const commitDate = __BUILD_DATE__
</script>

<template>
  <div class="settings-container">
    <div class="header">
      <button @click="router.back()" class="btn-back" aria-label="Go back">←</button>
      <h1>Settings</h1>
    </div>

    <div class="nav-buttons">
      <router-link to="/" class="btn btn-secondary">Home</router-link>
      <router-link to="/sessions" class="btn btn-secondary">View Sessions</router-link>
      <router-link to="/calendar" class="btn btn-secondary">Calendar</router-link>
    </div>

    <div class="info-section">
      <h2>Build Information</h2>
      <div class="info-item">
        <span class="info-label">Date:</span>
        <span class="info-value">{{ commitDate }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Commit:</span>
        <span class="info-value">{{ gitCommitHash }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Message:</span>
        <span class="info-value">{{ gitCommitMessage }}</span>
      </div>
    </div>

    <div class="empty-state">
      <p>More settings coming soon!</p>
    </div>
  </div>
</template>

<style scoped>
.settings-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.header h1 {
  margin: 0;
  font-size: 2rem;
  color: #2c3e50;
}

.btn-back {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  padding: 0.5rem;
  color: #2c3e50;
  transition: color 0.3s ease;
}

.btn-back:hover {
  color: #42b983;
}

.nav-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  flex: 1;
  min-width: 150px;
}

.btn-secondary {
  background: white;
  color: #2c3e50;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-secondary:hover {
  background: #f8f9fa;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.info-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-section h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1.25rem;
  border-bottom: 2px solid #42b983;
  padding-bottom: 0.5rem;
}

.info-item {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 600;
  color: #2c3e50;
  min-width: 80px;
}

.info-value {
  color: #666;
  word-break: break-word;
  font-family: 'Courier New', monospace;
}

.empty-state {
  background: white;
  border-radius: 8px;
  padding: 3rem 1.5rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-state p {
  margin: 0;
  color: #666;
  font-size: 1.125rem;
}

@media (max-width: 640px) {
  .settings-container {
    padding: 0.5rem;
  }

  .header h1 {
    font-size: 1.5rem;
  }

  .empty-state {
    padding: 2rem 1rem;
  }
}
</style>
