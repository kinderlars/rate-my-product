import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import {createLogger} from '../utils/logger'
import {Rating} from "../models/Rating";
import {UpdateProductRatingRequest} from "../requests/UpdateProductRatingRequest";

const logger = createLogger('todo-access')

const XAWS = AWSXRay.captureAWS(AWS)

export class RatingAccess {

  constructor(
      private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
      private readonly ratingTable: string = process.env.RATING_TABLE,
      private readonly ratingIndexByUserId = process.env.RATING_INDEX_BY_USERID
  ){}

  async getAllProductRatings(userId:string): Promise<Rating[]> {
    logger.info(`Starting DynamoDB query on table ${this.ratingTable}`)

    const result = await this.docClient.query({
      TableName: this.ratingTable,
      IndexName: this.ratingIndexByUserId,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()

    logger.info(`Scan return values ${result}`)
    const items = result.Items

    logger.info(`Query return ${items}`)
    return items as Rating[]
  }

  async getProductRating(userId: string, ratingId: string): Promise<Rating>{
    logger.info(`Getting product rating ${ratingId} of user ${userId}`)

    const result = await this.docClient.get({
      TableName: this.ratingTable,
      Key: {
        ratingId,
        userId
      }
    }).promise()

    const item = result.Item
    return item as Rating
  }

  async createProductRating(rating: Rating): Promise<Rating> {
    logger.info(`Creating new product rating ${rating}`)
    await this.docClient.put({
      TableName: this.ratingTable,

      Item: rating
    }).promise()

    return rating
  }

  async deleteTodo(ratingId: string,userId: string):Promise<boolean>{
    logger.info(`Deleting product rating ${ratingId}`)
    logger.info(`Provided parameters user: ${userId} and ratingId: ${ratingId}`)

    await this.docClient.delete({
      TableName: this.ratingTable,
      Key: {
        ratingId,
        userId
      }
    }).promise()

    return true
  }

  async updateRating(ratingId: string,userId: string, updateProductRatingRequest: UpdateProductRatingRequest): Promise<boolean> {
    logger.info(`Update process in data layer`)

    // Use # when using reserved keywords
    // https://stackoverflow.com/questions/36698945/scan-function-in-dynamodb-with-reserved-keyword-as-filterexpression-nodejs
    await this.docClient.update({
      TableName: this.ratingTable,
      Key: {
        ratingId,
        userId
      },
      UpdateExpression: "set purchaseDate = :purchaseDate, stars = :stars",
      ExpressionAttributeNames: {
        "#name": "name"
      },
      ExpressionAttributeValues: {
        ":purchaseDate": updateProductRatingRequest.purchaseDate,
        ":stars": updateProductRatingRequest.stars
      },
      ReturnValues: "UPDATED_NEW"
    }).promise()


    return true
  }

  async updateAttachmentUrl(ratingId: string,userId: string,attachmentUrl: string){
    logger.info(`Updating attachment url ${attachmentUrl} in database table for rating ${ratingId} owned by user ${userId}`)

    await this.docClient.update({
      TableName: this.ratingTable,
      Key: {
        ratingId,
        userId
      },
      UpdateExpression: "set attachmentUrl = :url",
      ExpressionAttributeValues: {
        ":url": attachmentUrl
      },
      ReturnValues: "UPDATED_NEW"
    }).promise()
  }
}
