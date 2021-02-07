import {createLogger} from "../utils/logger";
import {ProductAccess} from "../dataLayer/productAccess";
import {ImageAccess} from "../dataLayer/imageAccess";
import {Product} from "../models/Product";
import * as uuid from 'uuid';
import {CreateProductRequest} from "../requests/CreateProductRequest";
import {UpdateProductRequest} from "../requests/UpdateProductRequest";
import {RatingAccess} from "../dataLayer/ratingAccess";

const logger = createLogger('products')
const productAccess = new ProductAccess()
const ratingAccess = new RatingAccess()
const imageAccess = new ImageAccess()

/**
 * Get all products
 */
export async function getAllProducts(): Promise<Product[]> {
  logger.info('Getting all products')
  return productAccess.getAllProducts()
}

/**
 * Get certain product
 * @param productId
 */
export async function getProduct(productId:string): Promise<Product> {
  logger.info(`Getting product ${productId}`)

  return await productAccess.getProduct(productId)
}

export async function createProduct(createProductRequest: CreateProductRequest): Promise<Product> {

  const id = uuid.v4()
  const now = new Date().toISOString()

  const newItem: Product = {
    productId: id,
    createdAt: now,
    attachmentUrl: null,
    ...createProductRequest
  }

  const newProduct = await productAccess.createProduct(newItem)

  logger.info(`New product create ${JSON.stringify(newProduct)}`)

  return newProduct
}

export async function deleteProduct(productId: string): Promise<boolean> {

  const product = await productAccess.getProduct(productId)
  logger.info(`Return values of getProduct ${JSON.stringify(product)}`)

  if(!product)
    throw new Error('No item found')

  const ratings = await ratingAccess.getAllProductRatings(productId)

  if(ratings){
    logger.info(`Found ratings for product you are trying to delete`)
    for(let rating of ratings){
      logger.info(`Deleting rating ${rating.ratingId}`)
      await ratingAccess.deleteRating(rating.userId,rating.ratingId)
    }
  }

  logger.info(`Product ${JSON.stringify(product)} is prepared for deletion`)

  return await productAccess.deleteProduct(productId)
}

export async function updateProduct(productId: string, updateProductRequest: UpdateProductRequest):Promise<boolean>{
  logger.info(`Trying to update product ${productId} with payload ${JSON.stringify(updateProductRequest)}`)

  const product = await productAccess.getProduct(productId)
  logger.info(`PRODUCT ITEM: ${JSON.stringify(product)}`)

  if(!product)
    throw new Error('No item found')

  logger.info(`Starting update process`)

  const result = await productAccess.updateProduct(productId,updateProductRequest)

  return result

}

export async function updateAttachmentUrl(productId: string, imageId: string): Promise<Product>{
  logger.info(`Updating attachment url for image ${imageId} of product ${productId}`)
  const bucketName = process.env.IMAGES_S3_BUCKET
  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${imageId}`

  await productAccess.updateAttachmentUrl(productId,attachmentUrl)

  const updatedProduct = await getProduct(productId)
  logger.info(`Fetching updated todo ${JSON.stringify(updatedProduct)}`)

  return updatedProduct
}

export async function getS3UploadUrl(imageId: string): Promise<string> {

  const presignedUrl = await imageAccess.getUploadUrl(imageId)
  logger.info(`Retrieved presigned url from data layer ${presignedUrl}`)

  return presignedUrl
}
