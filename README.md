# Keypad Playwright Tests

End-to-end UI tests for the local keypad app in `apps/Automation task - keypad.html`.

## Tech Stack

- Node.js
- TypeScript
- Playwright (`@playwright/test`)

## Project Structure

- `apps/Automation task - keypad.html` - application under test
- `playwright.config.ts` - Playwright projects, workers, reporter, and browser settings
- `src/pages/KeypadPage.ts` - page object model for keypad interactions
- `src/fixture/TestFixture.ts` - test fixture that opens the local HTML via file URL
- `src/config/testConfig.ts` - resolves file URL for the keypad HTML
- `tests/KeypadInteractions.spec.ts` - primary smoke and regression scenarios
- `tests/testdata/KeypadTestData.ts` - keypad keys and invalid input datasets

## Prerequisites

- Node.js 18+ (recommended)
- npm

## Install

```bash
npm run setup
```

## Run Tests

Run all configured projects:

```bash
npm test
```

Run only smoke tests:

```bash
npm run test:smoke
```

Run only regression tests:

```bash
npm run test:regression
```

Run in headed mode:

```bash
npm run test:headed
```

Run smoke tests in debug mode:

```bash
npm run test:debug:smoke
```

Run regression tests in debug mode:

```bash
npm run test:debug:regression
```

Run one test file:

```bash
npx playwright test tests/KeypadInteractions.spec.ts
```

Run one scenario by title:

```bash
npx playwright test tests/KeypadInteractions.spec.ts -g "two digits are swapped"
```

## Reports

This project uses list + HTML reporting.

Open the latest HTML report:

```bash
npm run report
```

## Notes

- Tests use tags and Playwright projects:
  - `smoke-chromium`, `smoke-firefox`, `smoke-webkit` for `@Smoke`
  - `regression-chromium` for `@Regression`
- For the swapped-digits negative case, the test intentionally avoids swapping equal digits to prevent false positives.
- The app under test is local static HTML (no web server required).

## Troubleshooting

- Timeout waiting for keypad button selector:
  - Verify single-digit methods receive one digit (`0-9`) and multi-digit strings go through `pressDigits`.
- Browser missing error:
  - Run `npx playwright install`.
- If report does not open:
  - Re-run tests and then execute `npx playwright show-report`.
