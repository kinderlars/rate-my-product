import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import {createLogger} from "../../../utils/logger";
import {parseUserId} from "../../../auth/utils";
import {updateRating} from "../../../businessLayer/ratings";
import {UpdateProductRatingRequest} from "../../../requests/UpdateProductRatingRequest";


const logger = createLogger('update-rating')


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info(`Processing event: ${event}`)
  const ratingId = event.pathParameters.ratingId
  const updatedRating: UpdateProductRatingRequest = JSON.parse(event.body)

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)


  const rating = await updateRating(userId, ratingId, updatedRating)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      item: rating
    })
  }
}
