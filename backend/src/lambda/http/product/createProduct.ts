import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import {createLogger} from "../../../utils/logger";
import {CreateProductRequest} from "../../../requests/CreateProductRequest";
import {createProduct} from "../../../businessLayer/products";


const logger = createLogger('create-product')


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info(`Processing event: ${event}`)
  const newProduct: CreateProductRequest = JSON.parse(event.body)

  const createdProduct = await createProduct(newProduct)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      item: createdProduct
    })
  }
}
