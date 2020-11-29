# reshuffle-fastspring-connector

[Code](https://github.com/reshufflehq/reshuffle-fastspring-connector) |
[npm](https://www.npmjs.com/package/reshuffle-fastspring-connector) |
[Code sample](https://github.com/reshufflehq/reshuffle-fastspring-connector/examples)

`npm install reshuffle-fastspring-connector`

### Reshuffle FastSpring Connector

This package contains a [Reshuffle](https://github.com/reshufflehq/reshuffle)
connector to [fastspring.com](https://fastspring.com/). It can be used to
configure and manage online store and purchases, and provides access to the
full [FastSpring API](https://fastspring.com/docs/fastspring-api/).

This example gets the product list from Fast Spring:

```js
const { Reshuffle } = require('reshuffle')
const { FastSpringConnector } = require('reshuffle-fastspring-connector')

;(async () => {
  const app = new Reshuffle()
  const fs = new FastSpringConnector(app, {
    username: process.env.FASTSPRING_USERNAME,
    password: process.env.FASTSPRING_PASSWORD,
  })

  const products = await fs.getProductList()
  console.log(products)
})()
```

#### Table of Contents

[Configuration](#configuration) Configuration options

_Connector actions_:

[deleteProduct](#deleteProduct) Delete a product

[getLocalizedPrice](#getLocalizedPrice) Get price in a specific country

[getProductInfo](#getProductInfo) Get product information

[getProductList](#getProductList) Get a list of available products

[updateProduct](#updateProduct) Create or update one product

[updateProducts](#updateProducts) Create or update multiple products

[updateSimpleProduct](#updateSimpleProduct) Simplified create/update action

_REST_:

[DELETE](#DELETE) Direct REST DELETE

[GET](#GET) Direct REST GET

[POST](#POST) Direct REST POST

##### <a name="configuration"></a>Configuration options

```js
const app = new Reshuffle()
const fastSpringConnector = new FastSpringConnector(app)
```

#### Connector actions

##### <a name="deleteProduct"></a>Delete Product action

_Definition:_

```ts
(
  productID: string,
) => void
```

_Usage:_

```js
await fastSpringConnector.deleteProduct('my-product')
```

Delete a product from the store.

##### <a name="getLocalizedPrice"></a>Get Localized Price action

_Definition:_

```ts
(
  productID: string,
  countryCode?: string, // optional
) => number
```

_Usage:_

```js
const usd = await fastSpringConnector.getLocalizedPrice('my-product', 'US')
```

Get the price for a product in a specific country. If a price in local
currency was not defined for the product, then the stored price is
automaically converted into local currency.

##### <a name="getProductInfo"></a>Get Product Info action

_Definition:_

```ts
(
  productID: string,
) => Object
```

_Usage:_

```js
const info = await fastSpringConnector.getProductInfo('my-product')
```

Get the full product information. See [updateProduct](#updateProduct) below
for details.

##### <a name="getProductList"></a>Get Product List action

_Definition:_

```ts
() => string[]
```

_Usage:_

```js
const list = await fastSpringConnector.getProductist()
```

Get a list of product IDs for all the products in your store.

##### <a name="updateProduct"></a>Update Product action

_Definition:_

```ts
(
  productID: string,
  info: Object,
) => void
```

_Usage:_

```js
await fastSpringConnector.updateProduct('my-product', {
  display: {
    en: 'My Product',
  },
  pricing: {
    price: { USD: 3.14 },
  },
})
```

Create or update a product with a specified ID. A full description of the
product information object can be found
[here](https://fastspring.com/docs/products/#update).

Update is an additive operation, i.e. fields that are not included in the
`info` object are not removed from the object record. Rather, new fields are
added and new values for exsiting fields are updated.

If no product with the specified ID exists, then a new object is created.

##### <a name="updateProducts"></a>Update Products action

_Definition:_

```ts
(
  info: Object[],
) => void
```

_Usage:_

```js
await fastSpringConnector.updateProducts([
  { product: 'p1', display: { en: 'Product One' } },
  { product: 'p2', display: { en: 'Product Two' } },
])
```

Create or update multiple products using product info objects. A full
description of the product information object can be found
[here](https://fastspring.com/docs/products/#update).

##### <a name="updateSimpleProduct"></a>Update Simple Product action

_Definition:_

```ts
(
  productID: string,
  englishDisplay: string,  // display name
  usd: number,             // price in USD
) => void
```

_Usage:_

```js
await fastSpringConnector.updateProduct('my-product', 'My Product', 3.14)
```

A simplified interface for creating or updating product information. For full
control over product info, use [updateSimpleProduct](#updateSimpleProduct)
above.

#### REST

##### <a name="DELETE"></a>DELETE action

_Definition:_

```ts
(
  path: string,
) => object | text
```

_Usage:_

```js
const response = await fastSpringConnector.DELETE(`products/${id}`)
```

Send a DELETE request. Returns a JavaScript object for JSON responses or text
string otherwise. Throws an exception if a non-2xx HTTP code is returned.

##### <a name="GET"></a>GET action

_Definition:_

```ts
(
  path: string,
) => object | text
```

_Usage:_

```js
const response = await fastSpringConnector.GET(`products/${id}`)
```

Send a GET request. Returns a JavaScript object for JSON responses or text
string otherwise. Throws an exception if a non-2xx HTTP code is returned.

##### <a name="POST"></a>POST action

_Definition:_

```ts
(
  path: string,
  body: object,
) => object | text
```

_Usage:_

```js
const response = await fastSpringConnector.POST(
  'products',
  { products: productInfo },
)
```

Send a POST request. Returns a JavaScript object for JSON responses or text
string otherwise. Throws an exception if a non-2xx HTTP code is returned.
