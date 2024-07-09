import { describe, expect, test } from "@playwright/test";
import { waitForSelectorToBeVisible } from "../testUtils";

describe("code attribute", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should render code with props when creating a new element", async ({
    page,
  }) => {
    const code = "return <p>{props.message}</p>";
    const initialProps = JSON.stringify({ message: "hello world" });

    await page.evaluate(
      ({ code, initialProps }) => {
        document.body.innerHTML = `
      <near-social-viewer code="${code}" initialprops='${initialProps}'></near-social-viewer>
      `;
      },
      { code, initialProps }
    );

    // Verify the viewer is visible
    await waitForSelectorToBeVisible(page, "near-social-viewer");

    const msg = await page.getByText("hello world");
    await expect(msg).toBeVisible();
  });

  test("should render code with props when changing attributes of an existing element", async ({
    page,
  }) => {
    const code = "return <p>{props.message}</p>";
    const initialProps = JSON.stringify({ message: "hello world" });

    // Set code and initialProps attribute
    await page.evaluate(
      ({ code, initialProps }) => {
        const viewer = document.querySelector("near-social-viewer");
        viewer.setAttribute("code", code);
        viewer.setAttribute("initialprops", initialProps);
      },
      { code, initialProps }
    );

    await expect(await page.getByText("hello world")).toBeVisible();

    // change props
    await page.evaluate(() => {
      const viewer = document.querySelector("near-social-viewer");
      viewer.setAttribute(
        "initialprops",
        JSON.stringify({ message: "goodbye world" })
      );
    });

    await expect(await page.getByText("goodbye world")).toBeVisible();

    // change code
    await page.evaluate(() => {
      const viewer = document.querySelector("near-social-viewer");
      viewer.setAttribute("code", "return <p>working</p>;");
    });

    await expect(await page.getByText("working")).toBeVisible();
  });
});
