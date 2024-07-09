import { describe, expect, test } from "@playwright/test";
import { waitForSelectorToBeVisible } from "../testUtils";
import { Server } from "socket.io";
import http from 'http';


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

describe("hot-reload", () => {
  test("should trigger api request to */socket.io/* if 'enablehotreload' is true", async ({
    page,
  }) => {
    let websocketCount = 0;

    await page.goto("/");

    await page.route("**/socket.io/*", (route) => {
      websocketCount++;
      route.continue();
    });

    await page.evaluate(() => {
      document.body.innerHTML = `<near-social-viewer src="neardevs.testnet/widget/default" enablehotreload></near-social-viewer>`;
    });

    await waitForSelectorToBeVisible(page, "near-social-viewer");

    expect(websocketCount).toBeGreaterThan(0);
  });

  test("should not trigger api request to */socket.io/* if 'enablehotreload' is false", async ({
    page,
  }) => {
    let websocketCount = 0;

    await page.goto("/");

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
});


describe("hot-reload-file", () => {
 const redirectMap = {"anybody.near/widget/test": { code: "return <p id='hello-world'>Hello world</p>;" }}
 const redirectMapGoodbye = {"anybody.near/widget/test": { code: "return <p>Goodbye world</p>;" }}

	test("enable hot reload", async ({ page }) => {
		await page.goto("/");
	
		// Verify the viewer is visible
		await waitForSelectorToBeVisible(page, "near-social-viewer");
	
		await page.evaluate(() => {
			const viewer = document.querySelector("near-social-viewer");
			viewer.setAttribute("src", "anybody.near/widget/test"); // this code does not exist
		});
	
		await page.waitForTimeout(3000);
		
		// Verify error, code not found
		const errMsg = await page.getByText("is not found");
	
		expect(await errMsg.isVisible()).toBe(true);
	
		// Turn on hot reload
		// Set attribute enablehotreload to true
		await page.evaluate(() => {
			const viewer = document.querySelector("near-social-viewer");
			viewer.setAttribute("enablehotreload", "true");
			viewer.setAttribute("hotreloadwss", "ws://localhost:3001");
		});
	
		// Simulate WebSocket message for initial code
		await page.evaluate((code) => {
			const event = new CustomEvent('fileChange', { detail: JSON.stringify(code) });
			window.dispatchEvent(event);
		}, redirectMap);
	
		await page.waitForTimeout(3000);
		// Verify that the code is now found
		// We should see "Hello world"
		const helloWorld = await page.getByText("Hello world");
		expect(await helloWorld.isVisible()).toBe(true);
	
		// Simulate WebSocket message for updated code
		await page.evaluate((code) => {
			const event = new CustomEvent('fileChange', { detail: JSON.stringify(code) });
			window.dispatchEvent(event);
		}, redirectMapGoodbye);

		await page.waitForTimeout(3000);
	
		// Verify "Goodbye world" is visible
		const goodbyeWorld = await page.getByText("Goodbye world");

		expect(await goodbyeWorld.isVisible()).toBe(true);
	});
	});

describe("hot-reload-file-with-socket", () => {
  let io, httpServer;
  const PORT = 3001;
  const HOST = "localhost";

  test.beforeAll(async () => {
    httpServer = http.createServer();
    io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });

    const redirectMap = {
      "anybody.near/widget/test": {
        code: "return <p id='hello-world'>Hello world</p>;",
      },
    };

    io.on("connection", (socket) => {
      io.emit("fileChange", redirectMap);
    });

    // wait for socket start
    await new Promise((resolve) => {
      httpServer.listen(PORT, HOST, () => {
        console.log(`Socket.IO server running at http://${HOST}:${PORT}/`);
        resolve();
      });
    });
  });
  test("enable hot reload", async ({ page }) => {
    await page.goto("/");

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

    await page.evaluate(() => {
      document.body.innerHTML = `<near-social-viewer src="anybody.near/widget/test" enablehotreload hotreloadwss="ws://localhost:3001"></near-social-viewer>`;
    });

    await page.waitForSelector("near-social-viewer");

    const paragraph = page.locator("near-social-viewer >> p#hello-world");
    await paragraph.waitFor({ state: "visible", timeout: 5000 });

    const paragraphContent = await paragraph.textContent();
    expect(paragraphContent).toBe("Hello world");
  });

  test.afterAll(() => {
    io.close();
    httpServer.close();
  });
});