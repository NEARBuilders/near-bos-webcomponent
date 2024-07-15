# Testing Guide

This project uses [playwright](https://playwright.dev/) for end-to-end testing. Please become familiar with this documentation.

In general it is a good practice, and very helpful for reviewers and users of this project, that all use cases are covered in Playwright tests. Also, when contributing, try to make your tests as simple and clear as possible, so that they serve as examples on how to use the functionality.

## Writing tests

Tests should be written for each change or addition to the codebase.
If a new feature is introduced, tests should be written to validate its functionality. If a bug is fixed, tests should be written to prevent regression. Writing tests not only safeguards against future breaks by other developers but also accelerates development by minimizing manual coding and browser interactions.

When writing tests, remember to:

- Test user-visible behavior
- Make tests as isolated as possible
- Avoid testing third-party dependencies

> **[LEARN BEST PRACTICES](https://playwright.dev/docs/best-practices)**

See the [cookbook](#cookbook) for help in covering scenerios. It is possible to [generate tests](https://playwright.dev/docs/codegen) via the [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright).

## Running tests

## Running Playwright tests

To be able to run the [playwright](https://playwright.dev) tests, you first need to install the dependencies. You can see how this is done in [../.devcontainer/post-create.sh](./.devcontainer/post-create.sh) which is automatically executed when opening this repository in a github codespace.

When the dependencies are set up, you can run the test suite in your terminal:

```bash
yarn test
```



To run tests visually in the playwright UI, you can use the following command:

```bash
yarn test:ui
```

This will open the playwright UI in a browser, where you can run single tests, and also inspect visually.

If you want to use the playwright UI from a github codespace, you can use this command:

```bash
yarn test:ui:codespaces
```

Or to run tests through VS Code, see [Getting started - VS Code](https://playwright.dev/docs/getting-started-vscode).

## Recording video

You may automatically record video with your tests by setting

```json
"use": {
  "video": "on"
}
```

in the [playwright.config.js](../playwright.config.js). After running tests, you will find the output as a `.webm` in `./test-results`. Then, [convert to MP4](https://video.online-convert.com/convert/webm-to-mp4) and share.

It is encouraged to include video in pull requests in order to demonstrate functionality and prove thorough testing.

## Cookbook

### Capturing the VM Confirmation Popup

Currently, none of the tests post actual transactions to the smart contracts. Still you should try writing your tests so that they do the actual function call, but just skip the final step of sending the transaction. You can do this by capturing the transaction confirmation popup provided by the NEAR Social VM.

```javascript
const expectedTransactionData = {};

// click button that triggers transaction
await page.getByRole("button", { name: "Commit" }).nth(1).click();

const transactionObj = JSON.parse(await page.locator("div.modal-body code").innerText());

// do something with transactionObj
expect(transactionObj).toMatchObject(expectedTransactionData);
```
