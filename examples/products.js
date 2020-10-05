const { Reshuffle } = require('reshuffle')
const { FastSpringConnector } = require('reshuffle-fastspring-connector')

async function main() {
  const app = new Reshuffle()
  const fs = new FastSpringConnector(app, {
    username: process.env.FASTSPRING_USERNAME,
    password: process.env.FASTSPRING_PASSWORD,
  })

  const products = await fs.getProductList()
  console.log(products)
}

main()
