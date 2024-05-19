import { test, describe, expect } from '@playwright/test';

describe("bos-loader-url", () => {
    test.use({
        storageState: "playwright-tests/storage-states/bos-loader-url.json"
    });
    test("Should be possible to provide a redirectmap through flags in localStorage", async ({
        page,
    }) => {
        await page.route("http://localhost:3030", async (route) => {
            await route.fulfill({
                body: JSON.stringify(
                    {
                        components:
                        {
                            "something.near/widget/testcomponent":
                                { "code": "return 'I come from a redirect map pointed to by flags in localStorage';" }
                        }
                    }
                )
            });
        });
        await page.goto("/something.near/widget/testcomponent");
        await expect(page.getByText('I come from a redirect map pointed to by flags in localStorage')).toBeVisible();
    });
});

describe("session-storage", () => {
    test("Should be possible to provide a redirectmap through session storage key", async ({
        page,
    }) => {
        await page.context().addInitScript(() => {
            console.log('init script');
            sessionStorage.setItem('nearSocialVMredirectMap', JSON.stringify(
                {
                    "something.near/widget/testcomponent":
                        { "code": "return 'I come from a redirect map from session storage';" }
                }
            ));
        })
        await page.goto("/something.near/widget/testcomponent");
        await page.evaluate(() => {
            console.log(JSON.parse(sessionStorage.getItem("nearSocialVMredirectMap")))
        })
        await expect(await page.getByText('I come from a redirect map from session storage')).toBeVisible();
    });
});