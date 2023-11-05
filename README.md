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
