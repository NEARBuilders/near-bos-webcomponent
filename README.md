# NEAR BOS Web Component ( custom element )

This is a Proof of Concept of embedding a NEAR BOS widget into any web application as a Web Component / Custom element.

Just load react production react bundles into your index.html as shown below, and use the `near-social-viewer` custom element to embed the BOS widget.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Near social</title>
    <script defer="defer" src="/runtime.REPLACE_WITH_BUNDLE_HASH.bundle.js"></script>
    <script defer="defer" src="/main.REPLACE_WITH_BUNDLE_HASH.bundle.js"></script></head>
  <body>
    <h1>NEAR BOS embeddable custom element</h1>
    <near-social-viewer></near-social-viewer>
  </body>
</html>
```


## Setup & Development

Initialize repo:
```
yarn
```

Start development version:
```
yarn start
```

Production build:

```
yarn prod
```

Serve the production build:

```
yarn serve prod
```

# Use redirectmap for development

The NEAR social VM supports a feature called `redirectMap` which allows you to load widgets from other sources than the on chain social db. An example redirect map can look like this:

```json
{"devhub.near/widget/devhub.page.feed": {"code": "return 'hello';"}}
```

The result of applying this redirect map is that the widget `devhub.near/widget/devhub.page.feed` will be replaced by a string that says `hello`.

The `near-social-viewer` web component supports loading a redirect map from the session storage, which is useful when using the viewer for local development or test pipelines.

By setting the session storage key `nearSocialVMredirectMap` to the JSON value of the redirect map, the web component will pass this to the VM Widget config.

You can also use the same mechanism as [near-discovery](https://github.com/near/near-discovery/) where you can load components from a locally hosted [bos-loader](https://github.com/near/bos-loader) by adding the key `flags` to localStorage with the value `{"bosLoaderUrl": "http://127.0.0.1:3030" }`.


# Configuring the default widget

The `near-social-viewer` web component supports three attributes:

* `src` : the src of the widget to render (e.g. `devs.near/widget/default`)
* `code`: raw, valid, stringified widget code to render (e.g. `"return <p>hello world</p>"`)
* `initialProps`: initial properties to be passed to the rendered widget.

You can modify the default widget that is displayed via the configuration in `./bos.config.json`.

Make changes to `web4/index` as shown below:

```json
{
  "account": "devs.near",
  "web4": {
    "index": {
      "src": "devs.near/widget/default",
      // "code": "return <p>Hello world!</p>"
      "initialProps": {
        "message": "hello world!"
      }
    }
  }
}
```

Then be sure to build `yarn run prod` to see the changes take effect.

# Landing page for SEO friendly URLs

Normally, the URL path decides which component to be loaded. The path `/devhub.near/widget/app` will load the `app` component from the `devhub.near` account. DevHub is an example of a collection of many components that are part of a big app, and the `app` component is just a proxy to components that represent a `page`. Which page to display is controlled by the `page` query string parameter, which translates to `props.page` in the component.

In order to create a SEO friendly URL for such a page, we would like to represent a path like `/devhub.near/widget/app?page=community&handle=webassemblymusic` to be as easy as `/community/webassemblymusic`. And we do not want the viewer to look for a component named according to the path.

We can obtain this by setting the `src` attribute pointing to the component we want to use, and also set the `initialProps` attribute to the values taken from the URL path.

An example of this can be found in [router.spec.js](./playwright-tests/tests/router.spec.js).

```
test("for supporting SEO friendly URLs, it should be possible to set initialProps and src widget from any path", async ({ page }) => {
  await page.goto("/community/webassemblymusic");
  await page.evaluate(() => {
    const viewerElement = document.querySelector('near-social-viewer');
    viewerElement.setAttribute("src", "devhub.near/widget/app");
    const pathparts = location.pathname.split("/");
    viewerElement.setAttribute("initialProps", JSON.stringify({ page: pathparts[1], handle: pathparts[2] }));
  });
  await expect(await page.getByText('WebAssembly Music', { exact: true })).toBeVisible();
});
```

Here you can see that the viewer element `src` attribute is set to use the `devhub.near/widget/app` component, and the `initialProps` set to values from the path.

# Publishing libraries to NEARFS

For testing how the library would work when used from CDN, you may publish it to NEARFS.

 ```bash
yarn nearfs:publish-library:create:car
```

Take note of the IPFS address returned by this command, which will be used for finding the published library later. An example of what this looks like is `bafybeicu5ozyhhsd4bpz4keiur6cwexnrzwxla5kaxwhrcu52fkno5q5fa`

```bash
NODE_ENV=mainnet yarn nearfs:publish-library:upload:car youraccount.near
```

After uploading, it normally takes some minutes before the files are visible on NEARFS. When going to the expected URL based on the IPFS address we saw above, we will first see the message `Not found`.

This is an example of the NEARFS url, and you should replace with the IPFS address you received above:

https://ipfs.web4.near.page/ipfs/bafybeicu5ozyhhsd4bpz4keiur6cwexnrzwxla5kaxwhrcu52fkno5q5fa/

