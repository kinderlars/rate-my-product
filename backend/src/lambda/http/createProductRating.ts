import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import {createLogger} from "../../utils/logger";
import {createProductRating} from "../../businessLayer/ratings";
import {parseUserId} from "../../auth/utils";
import {CreateProductRatingRequest} from "../../requests/CreateProductRatingRequest";


const logger = createLogger('create-product')


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info(`Processing event: ${event}`)
  const productId = event.pathParameters.productId
  const newProductRating: CreateProductRatingRequest = JSON.parse(event.body)

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)


  const createdProduct = await createProductRating(userId, productId, newProductRating)

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
