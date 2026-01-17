# Tests Directory

This directory contains all test files for the Gym Tracker PWA application.

## Structure

The test directory mirrors the source code structure:

```
tests/
└── stores/          # Tests for Pinia stores
    ├── sessions.test.ts      - Session management tests
    ├── types.test.ts          - Type utilities tests
    ├── importUtils.test.ts    - Legacy data import tests
    └── exercises.test.ts      - Exercise utilities tests
```

## Running Tests

From the project root:

```bash
# Run all tests in watch mode
npm run test:unit

# Run all tests once
npx vitest run

# Run specific test file
npx vitest run tests/stores/sessions.test.ts

# Run tests with coverage
npx vitest run --coverage
```

## Adding New Tests

When adding tests:

1. Create test files in the appropriate subdirectory that mirrors the source structure
2. Name test files with `.test.ts` extension
3. Import from source using relative paths: `../../src/...`
4. Follow the existing test patterns and conventions

Example:

```typescript
// tests/components/ExerciseCard.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ExerciseCard from '../../src/components/ExerciseCard.vue'

describe('ExerciseCard', () => {
  it('should render exercise name', () => {
    const wrapper = mount(ExerciseCard, {
      props: { exercise: { id: '1', name: 'Squat', sets: [] } }
    })
    expect(wrapper.text()).toContain('Squat')
  })
})
```

## Test Categories

### Unit Tests (Current)

- Store logic (Pinia)
- Utility functions
- Type validations
- Data transformations

### Component Tests (Future)

- Vue component rendering
- User interactions
- Props and events
- Computed properties

### Integration Tests (Future)

- Multi-component workflows
- Store + component integration
- Routing

### E2E Tests (Future)

- Full user journeys
- Browser automation
- Critical paths

See [TESTING.md](../TESTING.md) in the project root for detailed documentation.
