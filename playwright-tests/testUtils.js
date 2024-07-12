import { expect } from "@playwright/test";
import path from "path";
import fs from "fs";

export const pauseIfVideoRecording = async (page) => {
  let isVideoRecorded = (await page.video()) ? true : false;
  if (isVideoRecorded) {
    await page.waitForTimeout(500);
  } else {
    await page.waitForTimeout(100);
  }
};

export const setInputAndAssert = async (page, selector, value) => {
  await page.fill(selector, value);
  const actualValue = await page.inputValue(selector);
  expect(actualValue).toBe(value);
};

export const selectAndAssert = async (page, selector, value) => {
  await page.selectOption(selector, { value: value });
  const selectedValue = await page.$eval(selector, (select) => select.value);
  expect(selectedValue).toBe(value);
};

export const waitForSelectorToBeVisible = async (page, selector) => {
  await page.waitForSelector(selector, {
    state: "visible",
  });
};

export const clickWhenSelectorIsVisible = async (page, selector) => {
  waitForSelectorToBeVisible(page, selector);
  await page.click(selector);
};

export const escapeHtml = (html) => {
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const useCode = async (page, filePath, props) => {
  const fullPath = path.join(__dirname, "code", filePath);
  try {
    const code = fs.readFileSync(fullPath, "utf8");
    const initialProps = props ? JSON.stringify(props) : null;

    // Set code and initialProps attribute
    await page.evaluate(
      ({ code, initialProps }) => {
        const viewer = document.querySelector("near-social-viewer");
        viewer.setAttribute("code", code);
        initialProps && viewer.setAttribute("initialprops", initialProps);
      },
      { code, initialProps }
    );

    // Verify the viewer is visible
    await waitForSelectorToBeVisible(page, "near-social-viewer");

    await pauseIfVideoRecording(page);
  } catch (err) {
    throw new Error(`Error loading file: ${err.message}`);
  }
};
