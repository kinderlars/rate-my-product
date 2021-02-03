import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import {createLogger} from "../../utils/logger";
import {cr} from "../../businessLayer/ratings";
import {CreateProductRequest} from "../../requests/CreateProductRequest";
import {parseUserId} from "../../auth/utils";


const logger = createLogger('create-rating')


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info(`Processing event: ${event}`)
  const newRating: CreateProductRequest = JSON.parse(event.body)

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)

  const createdRating = await createTodo(userId,newRating)

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
