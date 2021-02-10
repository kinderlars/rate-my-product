import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import {createLogger} from '../utils/logger'
import {Product} from "../models/Product";
import {UpdateProductRequest} from "../requests/UpdateProductRequest";

const logger = createLogger('product-access')

const XAWS = AWSXRay.captureAWS(AWS)

export class ProductAccess {

  constructor(
      private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
      private readonly productTable: string = process.env.PRODUCTS_TABLE
  ){}

  /**
   * Get all products of database table
   */
  async getAllProducts(): Promise<Product[]> {
    logger.info(`Starting DynamoDB query on table ${this.productTable}`)

    const result = await this.docClient.scan({
      TableName: this.productTable
    }).promise()

    logger.info(`Scan return values ${result}`)
    const items = result.Items

    logger.info(`Query return ${items}`)
    return items as Product[]
  }

  /**
   * Get certain product from database
   * @param productId
   */
  async getProduct(productId: string): Promise<Product>{
    logger.info(`Getting product ${productId}`)

    const result = await this.docClient.get({
      TableName: this.productTable,
      Key: {
        productId
      }
    }).promise()

    const item = result.Item
    return item as Product
  }

  /**
   * Create a product rating
   * @param rating
   */
  async createProduct(product: Product): Promise<Product> {
    logger.info(`Creating new product ${JSON.stringify(product)}`)
    await this.docClient.put({
      TableName: this.productTable,
      Item: product
    }).promise()

    return product
  }

  /**
   * Delete a product from the database
   * @param ratingId
   * @param userId
   */
  async deleteProduct(productId: string):Promise<boolean>{
    logger.info(`Deleting product ${productId}`)
    logger.info(`Provided parameters productId: ${productId}`)

    await this.docClient.delete({
      TableName: this.productTable,
      Key: {
        productId
      }
    }).promise()

    return true
  }

  async updateProduct(productId: string, updateProductRequest: UpdateProductRequest): Promise<boolean> {
    logger.info(`Update process in data layer`)

    // Use # when using reserved keywords
    // https://stackoverflow.com/questions/36698945/scan-function-in-dynamodb-with-reserved-keyword-as-filterexpression-nodejs
    await this.docClient.update({
      TableName: this.productTable,
      Key: {
        productId
      },
      UpdateExpression: "set productName = :productName, brand = :brand",
      ExpressionAttributeValues: {
        ":productName": updateProductRequest.productName,
        ":brand": updateProductRequest.brand
      },
      ReturnValues: "UPDATED_NEW"
    }).promise()


    return true
  }

  async updateAttachmentUrl(productId: string,attachmentUrl: string){
    logger.info(`Updating attachment url ${attachmentUrl} in database table products for product ${productId}`)

    await this.docClient.update({
      TableName: this.productTable,
      Key: {
        productId
      },
      UpdateExpression: "set attachmentUrl = :url",
      ExpressionAttributeValues: {
        ":url": attachmentUrl
      },
      ReturnValues: "UPDATED_NEW"
    }).promise()
  }
}
