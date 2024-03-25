import { expect, test } from "@playwright/test";

test("Verify default route loads successfully and displays expected content", async ({
  page,
}) => {
  // Navigate to the default route
  await page.goto("/");

  // Verify the viewer's default route
  await page.waitForSelector(
    'near-social-viewer[src="devs.near/widget/default"]',
    {
      state: "visible",
    }
  );

  // Get the value of the initialProps attribute
  const initialProps = await page.evaluate(() => {
    const viewer = document.querySelector(
      'near-social-viewer[src="devs.near/widget/default"]'
    );
    return viewer.getAttribute("initialProps");
  });

  // Assert initialProps parse correctly
  expect(JSON.parse(initialProps)).toEqual({ message: "hello world!" });

  // Verify default component renders
  await page.waitForSelector('div[data-component="devs.near/widget/default"]', {
    state: "visible",
  });

  // Verify default props are active
  await page.waitForSelector('h4:has-text("hello world!")', {
    state: "visible",
  });
});

test("should load the other routes with params when provided", async ({
  page,
}) => {
  // // Navigate to some route
  await page.goto("/efiz.near/widget/Tree?rootPath=devs.near");

  // Verify route loads
  await page.waitForSelector('div[data-component="efiz.near/widget/Node"]', {
    state: "visible",
  });

  // Verify provided props are active
  await page.waitForSelector('div:has-text("devs.near")', {
    state: "visible",
  });
});
