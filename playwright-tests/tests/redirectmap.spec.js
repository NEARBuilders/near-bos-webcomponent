import { describe, expect, test } from "@playwright/test";
import http from "http";
import { Server } from "socket.io";
import { waitForSelectorToBeVisible } from "../testUtils";

describe("bos-loader-url", () => {
  test.use({
    storageState: "playwright-tests/storage-states/bos-loader-url.json",
  });
  test("Should be possible to provide a redirectmap through flags in localStorage", async ({
    page,
  }) => {
    await page.route("http://localhost:3030", async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          components: {
            "something.near/widget/testcomponent": {
              code: "return 'I come from a redirect map pointed to by flags in localStorage';",
            },
          },
        }),
      });
    });
    await page.goto("/something.near/widget/testcomponent");
    await expect(
      page.getByText(
        "I come from a redirect map pointed to by flags in localStorage"
      )
    ).toBeVisible();
  });
});

describe("session-storage", () => {
  test("Should be possible to provide a redirectmap through session storage key", async ({
    page,
  }) => {
    await page.context().addInitScript(() => {
      console.log("init script");
      sessionStorage.setItem(
        "nearSocialVMredirectMap",
        JSON.stringify({
          "something.near/widget/testcomponent": {
            code: "return 'I come from a redirect map from session storage';",
          },
        })
      );
    });
  });
});

describe("hot-reload", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should trigger api request to */socket.io/* if hot reload is enabled", async ({
    page,
  }) => {
    let websocketCount = 0;

    await page.route("**/socket.io/*", (route) => {
      websocketCount++;
      route.continue();
    });

    await page.evaluate(() => {
      document.body.innerHTML = `<near-social-viewer src="neardevs.testnet/widget/default" config='{"dev": { "hotreload": { "enabled": true } } }'></near-social-viewer>`;
    });

    await waitForSelectorToBeVisible(page, "near-social-viewer");

    expect(websocketCount).toBeGreaterThan(0);
  });

  test("should not trigger api request to */socket.io/* if hot reload is not enabled", async ({
    page,
  }) => {
    let websocketCount = 0;

    await page.route("**/socket.io/*", (route) => {
      websocketCount++;
      route.continue();
    });

    await page.evaluate(() => {
      document.body.innerHTML = `<near-social-viewer src="neardevs.testnet/widget/default"></near-social-viewer>`;
    });

    await waitForSelectorToBeVisible(page, "near-social-viewer");

    expect(websocketCount).toEqual(0);
  });

  describe("with running socket server", () => {
    let io, httpServer;
    const PORT = 3001;
    let HOST = "localhost";

    test.beforeAll(async () => {
      httpServer = http.createServer();

      io = new Server(httpServer, {
        cors: {
          origin: `http://${HOST}:3000`,
          methods: ["GET", "POST"],
        },
      });

      io.on("connection", () => {
        io.emit("fileChange", {
          components: {
            "anybody.near/widget/test": {
              code: "return <p>hello world</p>;",
            },
          },
        });
      });

      // wait for socket start
      await new Promise((resolve) => {
        httpServer.listen(PORT, HOST, () => {
          resolve();
        });
      });
    });

    test("should show local redirect map and react to changes", async ({
      page,
    }) => {
      // Verify the viewer is visible
      await waitForSelectorToBeVisible(page, "near-social-viewer");

      await page.evaluate(() => {
        const viewer = document.querySelector("near-social-viewer");
        viewer.setAttribute("src", "anybody.near/widget/test"); // this code does not exist
      });

      await page.waitForSelector(
        'div.alert.alert-danger:has-text("is not found")'
      );

      // Verify error
      const errMsg = await page.locator(
        'div.alert.alert-danger:has-text("is not found")'
      );

      expect(await errMsg.isVisible()).toBe(true);

      let websocketCount = 0;

      await page.route("**/socket.io/*", (route) => {
        websocketCount++;
        route.continue();
      });

      const config = {
        dev: { hotreload: { enabled: true, wss: `ws://${HOST}:${PORT}` } },
      };

      // Enable hot reload
      await page.evaluate(
        ({ config }) => {
          const viewer = document.querySelector("near-social-viewer");
          viewer.setAttribute("config", JSON.stringify(config));
        },
        { config }
      );

      await page.waitForSelector("near-social-viewer");

      // Get the value of the config attribute
      const actualConfig = await page.evaluate(() => {
        const viewer = document.querySelector("near-social-viewer");
        return viewer.getAttribute("config");
      });

      // Assert it is set and equals custom value
      expect(actualConfig).toBe(JSON.stringify(config));

      // Assert web socket was hit
      expect(websocketCount).toBeGreaterThan(0);

      await expect(await page.getByText("hello world")).toBeVisible();

      io.emit("fileChange", {
        components: {
          "anybody.near/widget/test": { code: "return <p>goodbye world</p>;" },
        },
      });

      await expect(await page.getByText("goodbye world")).toBeVisible();
    });

    test.afterAll(() => {
      io.close();
      httpServer.close();
    });
  });
});
