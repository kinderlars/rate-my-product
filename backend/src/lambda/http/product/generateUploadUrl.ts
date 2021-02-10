import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import {createLogger} from "../../../utils/logger";
import * as uuid from 'uuid'
import {getProduct, getS3UploadUrl, updateAttachmentUrl} from "../../../businessLayer/products";


const logger = createLogger('url-generator')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const productId = event.pathParameters.productId

  logger.info(`Get presigned url for product ${productId}`)

  const validProduct = await getProduct(productId)


  if(!validProduct) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: "No matching product found!"
      })
    }
  }
  logger.info(`Provided product id ${productId} seems to return valid outout ${JSON.stringify(validProduct)}`)

  const imageId = uuid.v4()
  const presignedUrl = await getS3UploadUrl(imageId)
  logger.info(`The presigned url created ${JSON.stringify(presignedUrl)}`)

  const updatedProduct = await updateAttachmentUrl(productId,imageId)
  logger.info(`Updated object ${JSON.stringify(updatedProduct)}`)

  return {
    statusCode:200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: `{"uploadUrl": "${presignedUrl}"}`
  }
}

