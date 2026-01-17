# Testing Guide

This project uses **Vitest** for unit testing, which is a fast, modern testing framework built for Vite projects.

## Test Setup

- **Test Framework**: Vitest
- **Test Utilities**: @vue/test-utils (for Vue component testing)
- **Environment**: jsdom (simulates browser environment)
- **Configuration**: `vitest.config.ts`

## Running Tests

```bash
# Run tests in watch mode (interactive)
npm run test:unit

# Run tests once and exit
npx vitest run

# Run tests with coverage
npx vitest run --coverage
```

## Test Structure

Tests are organized in a dedicated `tests/` directory at the project root, mirroring the source structure:

```
tests/
└── stores/
    ├── sessions.test.ts      # Sessions store tests
    ├── types.test.ts          # Type utilities tests
    ├── importUtils.test.ts    # Import utilities tests
    └── exercises.test.ts      # Exercise utilities tests

src/
└── stores/
    ├── sessions.ts
    ├── types.ts
    ├── importUtils.ts
    └── exercises.ts
```

## Test Coverage

### Sessions Store (`sessions.test.ts`)

Tests for the core session management store:

- **Session Management**: Starting, finishing, canceling sessions
- **Exercise Management**: Adding/removing exercises and sets
- **Persistence**: localStorage save/load operations
- **Session Retrieval**: Getting sessions by ID, computed properties
- **Session Updates**: Updating completed sessions
- **UUID Generation**: Ensuring unique session IDs
- **Empty Sessions**: Allowing sessions with no exercises

### Type Utilities (`types.test.ts`)

Tests for TypeScript type utilities and session type validation:

- **SessionType Enum**: Verifying all session types (Legs, Chest, Back, Arms, Shoulders, Core, Cardio, FullBody, Mixed, CrossFit)
- **isValidSessionType**: Validating session type strings
- **toSessionType**: Converting strings to SessionType enum

### Import Utilities (`importUtils.test.ts`)

Tests for legacy data migration:

- **isLegacyFormat**: Detecting legacy format data
- **convertLegacySession**: Converting old session format to new format
- **Session Type Mapping**: Converting legacy numeric session types to enum values
- **Exercise Conversion**: Handling legacy exercise format with sets
- **Edge Cases**: Empty exercises, missing fields, custom exercises

### Exercise Utilities (`exercises.test.ts`)

Tests for exercise management:

- **Predefined Exercises**: Validating exercise list structure
- **getExercisesByType**: Filtering exercises by session type
- **getAllExerciseNames**: Getting unique exercise names
- **Exercise Lookup**: Finding exercises by name or ID
- **ID Generation**: Using predefined IDs or generating UUIDs for custom exercises
- **Coverage**: Ensuring exercises exist for all session types

## Writing New Tests

### Basic Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest'

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
  })

  it('should do something', () => {
    // Arrange
    const input = 'test'

    // Act
    const result = someFunction(input)

    // Assert
    expect(result).toBe('expected')
  })
})
```

### Testing Pinia Stores

```typescript
import { createPinia, setActivePinia } from 'pinia'
import { useYourStore } from '../yourStore'

beforeEach(() => {
  setActivePinia(createPinia())
})

it('should test store action', () => {
  const store = useYourStore()

  store.someAction()

  expect(store.someState).toBe('expected')
})
```

### Mocking

```typescript
import { vi } from 'vitest'

// Mock a module
vi.mock('uuid', () => ({
  v4: () => 'mock-uuid-123',
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock as Storage
```

## Test Best Practices

1. **One Assertion Per Test**: Each test should verify one specific behavior
2. **Descriptive Names**: Test names should clearly describe what they test
3. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
4. **Independent Tests**: Each test should be independent and not rely on other tests
5. **Test Edge Cases**: Include tests for error conditions, empty inputs, and boundary values
6. **Mock External Dependencies**: Mock APIs, localStorage, and other external dependencies

## Current Test Coverage

The current test suite covers:

- ✅ Core session management (CRUD operations)
- ✅ Exercise management within sessions
- ✅ localStorage persistence
- ✅ Session type validation and conversion
- ✅ Legacy data migration
- ✅ Exercise filtering and lookup
- ✅ UUID generation for sessions and exercises
- ✅ Empty session handling

## Future Testing Goals

- [ ] Add Vue component tests using @vue/test-utils
- [ ] Add integration tests for full user workflows
- [ ] Add E2E tests for critical paths
- [ ] Set up continuous integration to run tests automatically
- [ ] Add test coverage reporting
- [ ] Test calendar view computations
- [ ] Test session statistics calculations

## Troubleshooting

### Tests not running?

1. Make sure dependencies are installed: `npm install`
2. Check that Vitest is installed: `npx vitest --version`
3. Try running with verbose output: `npx vitest run --reporter=verbose`

### Tests failing?

1. Check the test output for specific error messages
2. Verify TypeScript compilation: `npm run type-check`
3. Check that all imports are correct
4. Ensure mocks are properly set up

### Need to debug a test?

Add `console.log()` statements or use Vitest's debugging features:

```typescript
it('should debug this', () => {
  console.log('Debug info:', someValue)
  // Or use debugger statement
  debugger
  expect(someValue).toBe('expected')
})
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Testing Library](https://testing-library.com/)
