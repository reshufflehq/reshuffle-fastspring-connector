import fetch from 'node-fetch'
import { BaseConnector, Reshuffle } from 'reshuffle-base-connector'

type Options = Record<string, any>

function validateUsername(username: string): string {
  if (typeof username !== 'string' || username.length === 0) {
    throw new Error(`Invalid username: ${username}`)
  }
  return username
}

function validatePassword(password: string): string {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error(`Invalid password: ${password}`)
  }
  return password
}

function validateProductID(productID: string): string {
  if (!/^[a-z0-9-]{2,}$/.test(productID)) {
    throw new Error(`Invalid product ID: ${productID}`)
  }
  return productID
}

class FastSpringError extends Error {
  constructor(
    public code: string,
    public status: string,
    public reason: string,
  ) {
    super(`FastSpring API Error: ${code} ${status}`)
  }
}

export class FastSpringConnector extends BaseConnector {
  private auth: string

  constructor(app: Reshuffle, options: Options, id?: string) {
    super(app, options, id)
    const un = validateUsername(options.username)
    const pw = validatePassword(options.password)
    this.auth = `Basic ${Buffer.from(`${un}:${pw}`).toString('base64')}`
  }

  private async request(method: string, path: string, body?: any) {
    const opts: any = {
      method,
      headers: { Authorization: this.auth },
    }
    if (body) {
      opts.body = JSON.stringify(body)
      opts.headers['Content-Type'] = 'application/json'
    }

    const res = await fetch(`https://api.fastspring.com/${path}`, opts)
    if (res.status < 200 || 300 <= res.status) {
      throw new FastSpringError(
        String(res.status),
        res.statusText,
        await res.text(),
      )
    }

    return res.json()
  }

  // Actions ////////////////////////////////////////////////////////

  public async deleteProduct(productID: string): Promise<void> {
    validateProductID(productID)
    const res = await this.DELETE(`products/${productID}`)
    const product = res.products[0]
    if (product.result === 'error') {
      throw new Error(`Error deleting product ${
        productID}: ${JSON.stringify(product.error)}`)
    }
  }

  public async getLocalizedPrice(productID: string, countryCode?: string) {
    validateProductID(productID)
    if (countryCode !== undefined &&
        (typeof countryCode !== 'string' || countryCode.length !== 2)) {
      throw new Error(`Invalid country code: ${countryCode}`)
    }
    const country = countryCode ? `?country=${countryCode}` : ''
    const res = await this.GET(`products/price/${productID}${country}`)
    if (res.result === 'error') {
      throw new Error(`Error getting price for product ${
        productID}: ${JSON.stringify(res.error)}`)
    }
    return res.products[0].pricing
  }

  public async getProductInfo(productID: string) {
    validateProductID(productID)
    const res = await this.GET(`products/${productID}`)
    const product = res.products[0]
    if (product.result === 'error') {
      throw new Error(`Error getting info for product ${
        productID}: ${JSON.stringify(product.error)}`)
    }
    return product
  }

  public async getProductList() {
    const res = await this.GET('products')
    if (res.result === 'error') {
      throw new Error(`Error listing products: ${JSON.stringify(res.error)}`)
    }
    return res.products
  }

  public async updateProduct(productID: string, info: any): Promise<void> {
    validateProductID(productID)
    if (info.product !== undefined && info.product !== productID) {
      throw new Error(`Product ID mismatch when creating product: ${
        productID} ${info.product}`)
    }
    info.product = productID
    const res = await this.POST('products', { products: [info] })
    const product = res.products[0]
    if (product.result === 'error') {
      throw new Error(`Error creating product ${
        productID}: ${JSON.stringify(product.error)}`)
    }
  }

  public async updateProducts(products: any[]): Promise<void> {
    if (!Array.isArray(products)) {
      throw new Error('Expected products array')
    }
    for (const { product } of products) {
      validateProductID(product)
    }
    const res = await this.POST('products', { products })
    for (const product of res.products) {
      if (product.result === 'error') {
        throw new Error(`Error creating product ${
          product.product}: ${JSON.stringify(product.error)}`)
      }
    }
  }

  public async updateSimpleProduct(
    productID: string,
    englishDisplay: string,
    usd: number,
  ) {
    validateProductID(productID)
    if (typeof englishDisplay !== 'string' || englishDisplay.length === 0) {
      throw new Error(`Invalid display for product ${
        productID}: ${englishDisplay}`)
    }
    if (typeof usd !== 'number' || usd < 0) {
      throw new Error(`Invalid USD price for product ${productID}: ${usd}`)
    }
    await this.updateProduct(productID, {
      display: { en: englishDisplay },
      pricing: { price: { USD: usd } },
    })
  }

  // REST ///////////////////////////////////////////////////////////

  public DELETE(path: string): Promise<any> {
    return this.request('DELETE', path)
  }

  public GET(path: string): Promise<any> {
    return this.request('GET', path)
  }

  public POST(path: string, body: any): Promise<any> {
    return this.request('POST', path, body)
  }
}
