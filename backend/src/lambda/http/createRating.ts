import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import {createLogger} from "../../utils/logger";
import {parseUserId} from "../../auth/utils";
import {createProductRating} from "../../businessLayer/ratings";
import {CreateProductRatingRequest} from "../../requests/CreateProductRatingRequest";


const logger = createLogger('create-rating')


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info(`Processing event: ${event}`)
  const newRating: CreateProductRatingRequest = JSON.parse(event.body)

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)

  const createdRating = await createProductRating(userId,newRating)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      item: createdRating
    })
  }
}
