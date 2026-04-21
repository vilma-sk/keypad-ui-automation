import { test, expect, KeypadPage } from '../src/fixture/TestFixture';
import { EXPECTED_KEYPAD_KEYS, INVALID_INPUT } from './testdata/KeypadTestData';

const EMPTY_INPUT_LABEL = '<empty>';
const ALL_KEYPAD_DIGITS = EXPECTED_KEYPAD_KEYS.filter(key => key >= '0' && key <= '9');
const INCORRECT = 'Incorrect';
const CORRECT = 'Correct!';

test.describe('Smoke', () => {
    test('should submit generated code successfully', { tag: '@Smoke' }, async ({ keypadPage }) => {
        const todoValue = await keypadPage.getTodoValue();

        await enterDigitsAndExpectValue(keypadPage, todoValue);
        await expectNoMessage(keypadPage);

        await submitAndValidateResult(keypadPage, todoValue, CORRECT);
    });
});

test.describe('Positive UI', () => {
    test('should display correct label on each keypad button', { tag: '@Regression' }, async ({ keypadPage }) => {
        for (const key of EXPECTED_KEYPAD_KEYS) {
            const keyButton = keypadPage.getKeyButton(key);
            await expect(keyButton).toHaveText(key);
        }
    });

    test('should show correct message in green color', { tag: '@Regression' }, async ({ keypadPage }) => {
        const todoValue = await keypadPage.getTodoValue();
        await enterDigitsAndExpectValue(keypadPage, todoValue);
        await keypadPage.submit();

        const color = await keypadPage.getMessageColor();
        expect(color).toBe('rgb(0, 128, 0)');
    });

    test('should show incorrect message in red color', { tag: '@Regression' }, async ({ keypadPage }) => {
        await keypadPage.submit();

        const color = await keypadPage.getMessageColor();
        expect(color).toBe('rgb(255, 0, 0)');
    });

    test('should show initial field state and keypad keys', { tag: '@Regression' }, async ({ keypadPage }) => {
        expect(await keypadPage.getFieldLabel(keypadPage.inputField)).toBe('Input:');
        expect(await keypadPage.getFieldLabel(keypadPage.todoField)).toBe('To do:');

        await expect(keypadPage.todoField).not.toBeEditable();
        await expect(keypadPage.inputField).not.toBeEditable();
        await expect(keypadPage.submitButton).toBeEnabled();

        await expectNoMessage(keypadPage);
        await expect(keypadPage.inputField).toBeEmpty();
        const todoValue = await keypadPage.getTodoValue();
        expect(todoValue).toHaveLength(5);
        expect(todoValue).toMatch(/^[0-9]{5}$/);

        const renderedKeypadKeys = await keypadPage.getKeypadKeys();
        expect(renderedKeypadKeys).toHaveLength(EXPECTED_KEYPAD_KEYS.length);
        expect(renderedKeypadKeys).toEqual(EXPECTED_KEYPAD_KEYS);
    });

    test('should allow entering all keypad digits', { tag: '@Regression' }, async ({ keypadPage }) => {
        const todoValue = await keypadPage.getTodoValue();

        await test.step('Enter all keypad digits in sequence', async () => {
            for (const [index, digit] of ALL_KEYPAD_DIGITS.entries()) {
                await keypadPage.pressKey(digit);

                const current = ALL_KEYPAD_DIGITS.slice(0, index + 1).join('');
                await expect(keypadPage.inputField).toHaveValue(current);
            }

            await expectNoMessage(keypadPage);
        });

        await test.step('Submit entered digits and validate the result', async () => {
            const expectedResult = todoValue !== ALL_KEYPAD_DIGITS.join('') ? INCORRECT : CORRECT;
            await submitAndValidateResult(keypadPage, todoValue, expectedResult);
        });
    });
});

test.describe('Behavior', () => {
    test('should delete on empty input from initial state without error', { tag: '@Regression' }, async ({ keypadPage }) => {
        const todoValue = await keypadPage.getTodoValue();

        await keypadPage.deleteDigit();
        await expect(keypadPage.inputField).toHaveValue('');
        await expectNoMessage(keypadPage);

        await submitAndValidateResult(keypadPage, todoValue, INCORRECT);
    });

    test('should remove single digit on delete leaving input empty', { tag: '@Regression' }, async ({ keypadPage }) => {
        const todoValue = await keypadPage.getTodoValue();
        const firstDigit = todoValue[0];

        await keypadPage.pressKey(firstDigit);
        await expect(keypadPage.inputField).toHaveValue(firstDigit);

        await keypadPage.deleteDigit();
        await expect(keypadPage.inputField).toHaveValue('');

        await submitAndValidateResult(keypadPage, todoValue, INCORRECT);
    });

    test('should clear input after repeated delete and submit as incorrect', { tag: '@Regression' }, async ({ keypadPage }) => {
        const todoValue = await keypadPage.getTodoValue();

        await enterDigitsAndExpectValue(keypadPage, todoValue);

        for (const _ of todoValue) {
            await keypadPage.deleteDigit();
        }

        await expect(keypadPage.inputField).toHaveValue('');
        await keypadPage.deleteDigit();

        await submitAndValidateResult(keypadPage, todoValue, INCORRECT);
    });

    test('should remove last digit on delete', { tag: '@Regression' }, async ({ keypadPage }) => {
        const todoValue = await keypadPage.getTodoValue();
        const expectedValueAfterDelete = todoValue.slice(0, -1);

        await enterDigitsAndExpectValue(keypadPage, todoValue);

        await keypadPage.deleteDigit();
        await expect(keypadPage.inputField).toHaveValue(expectedValueAfterDelete);

        await submitAndValidateResult(keypadPage, todoValue, INCORRECT);
    });

    test('should ignore hash when input is empty', { tag: '@Regression' }, async ({ keypadPage }) => {
        const todoValue = await keypadPage.getTodoValue();

        await keypadPage.pressHash();
        await expect(keypadPage.inputField).toHaveValue('');
        await expectNoMessage(keypadPage);

        await submitAndValidateResult(keypadPage, todoValue, INCORRECT);
    });

    test('should ignore hash when input already has digits', { tag: '@Regression' }, async ({ keypadPage }) => {
        const todoValue = await keypadPage.getTodoValue();

        await enterDigitsAndExpectValue(keypadPage, todoValue);
        await keypadPage.pressHash();
        await expect(keypadPage.inputField).toHaveValue(todoValue);

        await submitAndValidateResult(keypadPage, todoValue, CORRECT);
    });

    test('should ignore hash after delete and in-between typing', { tag: '@Regression' }, async ({ keypadPage }) => {
        test.slow();

        const firstTodoValue = await keypadPage.getTodoValue();
        const lastDigit = firstTodoValue.slice(-1);

        await test.step('Ignore hash after deleting the last digit', async () => {
            await enterDigitsAndExpectValue(keypadPage, firstTodoValue);
            await keypadPage.deleteDigit();
            await keypadPage.pressHash();
            await expect(keypadPage.inputField).toHaveValue(firstTodoValue.slice(0, -1));

            await keypadPage.pressKey(lastDigit);
            await expect(keypadPage.inputField).toHaveValue(firstTodoValue);
        });

        const secondTodoValue = await test.step('Submit first correct value and capture regenerated todo', async () => {
            return submitAndValidateResult(keypadPage, firstTodoValue, CORRECT);
        });
        const prefix = secondTodoValue.slice(0, 3);
        const suffix = secondTodoValue.slice(3);

        await test.step('Ignore hash while typing the regenerated todo', async () => {
            await keypadPage.pressDigits(prefix);
            await keypadPage.pressHash();
            await expect(keypadPage.inputField).toHaveValue(prefix);
            await keypadPage.pressDigits(suffix);
            await expect(keypadPage.inputField).toHaveValue(secondTodoValue);
        });

        await test.step('Submit the regenerated todo successfully', async () => {
            await submitAndValidateResult(keypadPage, secondTodoValue, CORRECT);
        });
    });
});

test.describe('Negative', () => {
    test('should show incorrect when two digits are swapped', { tag: '@Regression' }, async ({ keypadPage }) => {
        const todoValue = await keypadPage.getTodoValue();
        const swappedDigits = swapDigits(todoValue, 1, todoValue[1] !== todoValue[2] ? 2 : 3);

        await enterDigitsAndExpectValue(keypadPage, swappedDigits);

        await submitAndValidateResult(keypadPage, todoValue, INCORRECT);
    });

    test('should show incorrect for reversed value', { tag: '@Regression' }, async ({ keypadPage }) => {
        const todoValue = await keypadPage.getTodoValue();
        const reversedDigits = todoValue.split('').reverse().join('');

        await enterDigitsAndExpectValue(keypadPage, reversedDigits);

        await submitAndValidateResult(keypadPage, todoValue, INCORRECT);
    });

    test('should show incorrect when one extra digit is appended', { tag: '@Regression' }, async ({ keypadPage }) => {
        const todoValue = await keypadPage.getTodoValue();
        const appendedDigits = todoValue + todoValue[0];

        await enterDigitsAndExpectValue(keypadPage, appendedDigits);

        await submitAndValidateResult(keypadPage, todoValue, INCORRECT);
    });

    test('should show incorrect when last digit is changed', { tag: '@Regression' }, async ({ keypadPage }) => {
        const todoValue = await keypadPage.getTodoValue();
        const lastDigit = todoValue.slice(-1);
        const replacementDigit = lastDigit === '9' ? '8' : '9';
        const modifiedDigits = todoValue.slice(0, -1) + replacementDigit;

        await enterDigitsAndExpectValue(keypadPage, modifiedDigits);

        await submitAndValidateResult(keypadPage, todoValue, INCORRECT);
    });

    test.describe('invalid input from test data', () => {
        for (const input of INVALID_INPUT) {
            const testCaseName = input === '' ? EMPTY_INPUT_LABEL : input;

            test(`should reject invalid input: ${testCaseName}`, { tag: '@Regression' }, async ({ keypadPage }) => {
                const todoValue = await keypadPage.getTodoValue();

                await enterDigitsAndExpectValue(keypadPage, input);

                await submitAndValidateResult(keypadPage, todoValue, INCORRECT);
            });
        }
    });
});

test.describe('Todo integrity', () => {
    test('should regenerate todo after correct submission', { tag: '@Regression' }, async ({ keypadPage }) => {
        const todoValue = await keypadPage.getTodoValue();
        await enterDigitsAndExpectValue(keypadPage, todoValue);

        const newTodoValue = await submitAndValidateResult(keypadPage, todoValue, CORRECT);
        expect(newTodoValue).toMatch(/^[0-9]{5}$/);
    });

    test('should regenerate todo after incorrect submission', { tag: '@Regression' }, async ({ keypadPage }) => {
        const todoValue = await keypadPage.getTodoValue();

        const newTodoValue = await submitAndValidateResult(keypadPage, todoValue, INCORRECT);
        expect(newTodoValue).toMatch(/^[0-9]{5}$/);
    });

    test('should correctly validate two consecutive correct submissions', { tag: '@Regression' }, async ({ keypadPage }) => {
        const firstTodoValue = await keypadPage.getTodoValue();

        const secondTodoValue = await test.step('Submit the first correct todo value', async () => {
            await enterDigitsAndExpectValue(keypadPage, firstTodoValue);
            return submitAndValidateResult(keypadPage, firstTodoValue, CORRECT);
        });

        await test.step('Submit the regenerated correct todo value', async () => {
            await enterDigitsAndExpectValue(keypadPage, secondTodoValue);
            await submitAndValidateResult(keypadPage, secondTodoValue, CORRECT);
        });
    });
});

async function expectNoMessage(keypadPage: KeypadPage): Promise<void> {
    await expect(keypadPage.getMessageText()).resolves.toBeNull();
}

async function enterDigitsAndExpectValue(keypadPage: KeypadPage, value: string): Promise<void> {
    await keypadPage.pressDigits(value);
    await expect(keypadPage.inputField).toHaveValue(value);
}

async function submitAndValidateResult(
    keypadPage: KeypadPage,
    initialTodoValue: string,
    expectedMessage: string
): Promise<string> {
    await keypadPage.submit();

    const message = await keypadPage.getMessageText();
    expect(message).toBe(expectedMessage);

    await expect(keypadPage.inputField).toHaveValue('');

    const regeneratedTodoValue = await keypadPage.getTodoValue();
    expect(regeneratedTodoValue).toHaveLength(initialTodoValue.length);
    expect.soft(regeneratedTodoValue).not.toBe(initialTodoValue);

    return regeneratedTodoValue;
}

function swapDigits(value: string, firstIndex: number, secondIndex: number): string {
    const chars = value.split('');
    [chars[firstIndex], chars[secondIndex]] = [chars[secondIndex], chars[firstIndex]];
    return chars.join('');
}
