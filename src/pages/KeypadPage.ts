import { Page, Locator } from '@playwright/test';

export class KeypadPage {
    readonly page: Page;
    readonly submitButton: Locator;
    readonly todoField: Locator;
    readonly inputField: Locator;
    readonly message: Locator;
    readonly keypadKeys: Locator;
    readonly deleteButton: Locator;
    readonly hashButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.submitButton = page.getByRole('button', { name: 'Click' });
        this.todoField = page.locator('#todo');
        this.inputField = page.locator('#input');
        this.message = page.locator('#msg');
        this.keypadKeys = page.locator('#keypad > div');
        this.deleteButton = page.locator('#button-del');
        this.hashButton = page.locator('#button-\\#');
    }

    async getTodoValue(): Promise<string> {
        return this.todoField.inputValue();
    }

    async open(fileUrl: string): Promise<void> {
        await this.page.goto(fileUrl);
    }

    async pressDigit(digit: string): Promise<void> {
        await this.getKeyButton(digit).click();
    }

    getKeyButton(key: string): Locator {
        return this.page.locator(`[id="button-${key}"]`);
    }

    async pressDigits(value: string): Promise<void> {
        for (const digit of value) {
            await this.pressDigit(digit);
        }
    }

    async deleteDigit(): Promise<void> {
        await this.deleteButton.click();
    }

    async pressHash(): Promise<void> {
        await this.hashButton.click();
    }

    async submit(): Promise<void> {
        await this.submitButton.click();
    }

    async isMessageVisible(): Promise<boolean> {
        return this.message.isVisible();
    }

    async getMessageText(): Promise<string | null> {
        const visible = await this.isMessageVisible();
        if (!visible) {
            return null;
        }

        return (await this.message.textContent())?.trim() ?? '';
    }

    async getMessageColor(): Promise<string> {
        return this.message.evaluate((el) => getComputedStyle(el).color);
    }

    async getInputValue(): Promise<string> {
        return this.inputField.inputValue();
    }

    async getFieldLabel(locator: Locator): Promise<string> {
        return (await locator.locator('xpath=preceding-sibling::span[1]').textContent())?.trim() ?? '';
    }

    async getKeypadKeys(): Promise<string[]> {
        const keys = await this.keypadKeys.allTextContents();
        return keys.map((key) => key.trim()).filter(Boolean);
    }
}