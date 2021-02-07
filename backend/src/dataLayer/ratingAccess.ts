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
      private readonly ratingTable: string = process.env.USER_RATINGS_TABLE,
      private readonly productIndexByUserId = process.env.PRODUCT_INDEX_BY_USERID
  ) {
  }

  async getAllRatings(): Promise<Rating[]> {
    logger.info(`Starting DynamoDB scan on table ${this.ratingTable}`)

    const result = await this.docClient.scan({
      TableName: this.ratingTable
    }).promise()

    logger.info(`Scan return values ${result}`)
    const items = result.Items

    logger.info(`Scan return ${items}`)
    return items as Rating[]
  }

  /**
   * Get all user ratings
   */
  async getAllUserRatings(userId:string): Promise<Rating[]> {
    logger.info(`Starting DynamoDB query on table ${this.ratingTable}`)

    const result = await this.docClient.query({
      TableName: this.ratingTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()

    logger.info(`Query return values ${result}`)

    const items = result.Items
    return items as Rating[]
  }

  /**
   * Get all ratings
   * Scan is used, as primary key is not accessed and therefore query cannot be used
   */
  async getAllProductRatings(productId:string): Promise<Rating[]> {
    logger.info(`Starting DynamoDB scan on table ${this.ratingTable}`)

    const result = await this.docClient.scan({
      TableName: this.ratingTable,
      FilterExpression: 'productId = :productId',
      ExpressionAttributeValues: {
        ':productId': productId
      }
    }).promise()

    logger.info(`Scan return values ${result}`)
    const items = result.Items

    logger.info(`Query return ${items}`)
    return items as Rating[]
  }


  /**
   * Get product rating
   * @param ratingId
   * @param productId
   */
  async getProductRating(ratingId: string,productId:string): Promise<Rating> {
    logger.info(`Getting rating ${ratingId} of product ${productId}`)

    const result = await this.docClient.get({
      TableName: this.ratingTable,
      Key: {
        ratingId,
        productId
      }
    }).promise()

    const item = result.Item
    return item as Rating
  }

  /**
   * Get user rating
   * @param userId
   * @param ratingId
   */
  async getUserRating(userId: string, ratingId: string): Promise<Rating> {
    logger.info(`Getting rating ${ratingId} of user ${userId}`)

    const result = await this.docClient.get({
      TableName: this.ratingTable,
      Key: {
        userId,
        ratingId
      }
    }).promise()

    const item = result.Item
    return item as Rating
  }

  /**
   * Get user rating for a product
   * @param userId
   * @param productId
   */
  async getUserProductRating(userId: string, productId: string): Promise<Rating> {
    logger.info(`Getting product ${productId} rating of user ${userId}`)

    const result = await this.docClient.query({
      TableName: this.ratingTable,
      IndexName: this.productIndexByUserId,
      KeyConditionExpression: 'userId = :userId and productId = :productId',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':productId' : productId
      }
    }).promise()

    const item = result.Items[0]
    return item as Rating
  }

  /**
   * Create a product rating
   * @param rating

   */
  async createProductRating(rating: Rating): Promise<Rating> {
    logger.info(`Creating new product rating ${rating}`)
    await this.docClient.put({
      TableName: this.ratingTable,
      Item: rating
    }).promise()

    return rating
  }

  /**
   * Delete a certain product rating
   * @param ratingId
   * @param userId
   */
  async deleteRating(userId: string,ratingId: string): Promise<boolean> {
    logger.info(`Deleting rating ${ratingId}`)
    logger.info(`Provided parameters user: ${userId} and ratingId: ${ratingId}`)

    await this.docClient.delete({
      TableName: this.ratingTable,
      Key: {
        userId,
        ratingId
      }
    }).promise()

    return true
  }

  async updateUserRating(userId: string, ratingId: string, updateProductRatingRequest: UpdateProductRatingRequest): Promise<boolean> {
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
}

//   async updateAttachmentUrl(ratingId: string,userId: string,attachmentUrl: string){
//     logger.info(`Updating attachment url ${attachmentUrl} in database table for rating ${ratingId} owned by user ${userId}`)
//
//     await this.docClient.update({
//       TableName: this.ratingTable,
//       Key: {
//         ratingId,
//         userId
//       },
//       UpdateExpression: "set attachmentUrl = :url",
//       ExpressionAttributeValues: {
//         ":url": attachmentUrl
//       },
//       ReturnValues: "UPDATED_NEW"
//     }).promise()
//   }
// }
