import { test as base, expect, Locator } from '@playwright/test';
import { KeypadPage } from '../pages/KeypadPage';
import { keypadUrl } from '../config/testConfig';

type KeypadFixtures = {
    keypadPage: KeypadPage;
};

export const test = base.extend<KeypadFixtures>({
    keypadPage: async ({ page }, use) => {
        const keypadPage = new KeypadPage(page);
        await keypadPage.open(keypadUrl);
        await use(keypadPage);
    }
});

export { expect, KeypadPage, Locator };