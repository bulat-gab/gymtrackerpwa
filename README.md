# Gym Tracker PWA
[![Deploy to GitHub Pages](https://github.com/bulat-gab/gymtrackerpwa/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/bulat-gab/gymtrackerpwa/actions/workflows/deploy.yml)

https://bulat-gab.github.io/gymtrackerpwa/

A Progressive Web App for tracking gym sessions and workouts. Built with Vue 3, TypeScript, and Pinia.

## Features

- 🏋️ **Active Session Tracking**: Start a workout session, add exercises with sets, reps, and weights
- 📊 **Session History**: View all completed workout sessions with detailed information
- 📅 **Calendar View**: See which dates you worked out with a visual calendar
- 💾 **Offline Support**: Works offline with local storage persistence
- 📱 **PWA Ready**: Installable on iOS and Android devices
- 🔄 **Import/Export**: Import your previous workout history from JSON files

## Getting Started

### Prerequisites

- Node.js ^20.19.0 or >=22.12.0
- npm

### Installation

```bash
npm install
```

### Generate PWA Icons

```bash
npm run generate-icons
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

### Starting a Workout Session

1. Click "Start Workout Session" on the home page
2. Add exercises by clicking "+ Add Exercise"
3. For each exercise, add sets with reps and weight
4. Click "Finish Session" when done

### Viewing Sessions

- **Sessions List**: View all completed sessions with exercise details
- **Calendar**: See a calendar view highlighting dates with workouts

### Importing Previous Data

1. Go to the home page
2. Click "Choose JSON File" in the Import section
3. Select your exported JSON file with workout sessions

The JSON should be an array of session objects matching this structure:

```json
[
  {
    "id": "session-123",
    "date": "2024-01-15",
    "startTime": "2024-01-15T10:00:00.000Z",
    "endTime": "2024-01-15T11:30:00.000Z",
    "exercises": [
      {
        "id": "exercise-1",
        "name": "Bench Press",
        "sets": [
          { "reps": 10, "weight": 60 },
          { "reps": 8, "weight": 65 }
        ]
      }
    ]
  }
]
```

## Project Structure

```
src/
├── assets/          # CSS and static assets
├── components/      # Reusable Vue components
├── router/          # Vue Router configuration
├── stores/          # Pinia stores (state management)
│   └── sessions.ts  # Gym session store
└── views/           # Route-level components
    ├── HomeView.vue
    ├── ActiveSessionView.vue
    ├── SessionsListView.vue
    └── CalendarView.vue
```

## PWA Installation

### iOS (iPhone/iPad)

1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. The app will be installed as a standalone app

### Android

1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Install app" or "Add to Home screen"

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type safety
- **Pinia** - State management
- **Vue Router** - Routing
- **Vite** - Build tool and dev server
- **Vite PWA Plugin** - PWA support
- **Vitest** - Unit testing
- **ESLint + Prettier** - Code quality

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test:unit` - Run unit tests
- `npm run lint` - Lint and fix code
- `npm run format` - Format code with Prettier
- `npm run type-check` - Type check without building
- `npm run generate-icons` - Generate PWA icons

## Data Storage

All workout data is stored locally in your browser's localStorage. This means:
- Data persists between sessions
- Works completely offline
- Data is specific to each browser/device
- To backup: Use the browser's developer tools to export localStorage data

## License

MIT
