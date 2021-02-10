import * as uuid from 'uuid'
import { createLogger } from '../utils/logger'
import {RatingAccess} from '../dataLayer/ratingAccess';
import {UpdateProductRatingRequest} from "../requests/UpdateProductRatingRequest";
// import {ImageAccess} from "../dataLayer/imageAccess";
import {Rating} from '../models/Rating';
import {RatingUpdate} from "../models/RatingUpdate";
import {CreateProductRatingRequest} from "../requests/CreateProductRatingRequest";
import {getProduct} from "./products";


const logger = createLogger('ratings')
const ratingAccess = new RatingAccess()
// const imageAccess = new ImageAccess()

/**
 * Function that returns all ratings available
 */
export async function getAllRatings(): Promise<Rating[]> {
  logger.info(`Getting all ratings`)
  return ratingAccess.getAllRatings()
}

/**
 * Function that returns all ratings for a specific user
 * @param userId
 */
export async function getAllUserRatings(userId: string): Promise<Rating[]> {
  logger.info(`Getting all ratings of user ${userId}`)
  return ratingAccess.getAllUserRatings(userId)
}

/**
 * Function that returns all ratings for a specific product
 * @param productId
 */
export async function getAllProductRatings(productId:string): Promise<Rating[]> {
  logger.info(`Getting all ratings for product ${productId}`)
  return ratingAccess.getAllProductRatings(productId)
}

/**
 * Function that gets a single users product rating
 * @param userId
 * @param productId
 */
export async function getUserProductRating(userId: string, productId:string): Promise<Rating>{
  logger.info(`Getting user ${userId} rating for product ${productId}`)
  return ratingAccess.getUserProductRating(userId,productId)
}

/**
 * Get product rating
 * @param ratingId
 * @param productId
 */
export async function getProductRating(ratingId:string,productId:string): Promise<Rating> {
  logger.info(`Getting rating ${ratingId} for product ${productId}`)

  return await ratingAccess.getProductRating(ratingId,productId)
}

/**
 * Get rating created by user
 * @param userId
 * @param ratingId
 */
export async function getUserRating(userId: string, ratingId:string): Promise<Rating> {
  logger.info(`Getting rating ${ratingId} for user ${userId}`)

  return await ratingAccess.getUserRating(userId,ratingId)
}

/**
 * Create a product rating
 * @param userId
 * @param createProductRatingRequest
 */
export async function createProductRating(userId: string, productId: string, createProductRatingRequest: CreateProductRatingRequest): Promise<Rating> {

  const id = uuid.v4()
  const now = new Date().toISOString()

  const ratingExists = await getUserProductRating(userId,productId)

  if(ratingExists)
    throw new Error('User already rated this product')

  const productExists = await getProduct(productId)

  if(!productExists){
    throw new Error('No product found that you can attach the rating to')
  }

  const newItem: Rating = {
    userId: userId,
    ratingId: id,
    productId: productId,
    purchaseDate: now,
    ...createProductRatingRequest
  }

  const result = await ratingAccess.createProductRating(newItem)

  logger.info(`New rating created ${newItem}`)

  return result
}

/**
 * Delete a rating
 * @param userId
 * @param ratingId
 */
export async function deleteRating(userId: string, ratingId: string): Promise<boolean> {

  const rating = await ratingAccess.getUserRating(userId,ratingId)
  logger.info(`Return values of getUserRating ${JSON.stringify(rating)}`)

  if(!rating)
    throw new Error('No item found')

  logger.info(`Rating ${JSON.stringify(rating)} for user ${userId} is prepared for deletion`)

  return await ratingAccess.deleteRating(userId,ratingId)
}

/**
 * Update a rating
 * @param ratingId
 * @param userId
 * @param updateProductRatingRequest
 */
export async function updateRating(userId: string, ratingId: string,updateProductRatingRequest: UpdateProductRatingRequest):Promise<boolean>{
  logger.info(`Trying to update rating ${ratingId} for user ${userId} with payload ${JSON.stringify(updateProductRatingRequest)}`)

  const rating = await ratingAccess.getUserRating(userId,ratingId)
  logger.info(`RATING ITEM: ${JSON.stringify(rating)}`)

  if(!rating)
    throw new Error('No item found')

  logger.info(`Starting update process`)

  const result = await ratingAccess.updateRating(userId,ratingId,updateProductRatingRequest as RatingUpdate)

  return result

}

// export async function updateAttachmentUrl(ratingId: string, userId: string, imageId: string): Promise<Rating>{
//   logger.info(`Updating attachment url for image ${imageId} of rating ${ratingId} owned by user ${userId}`)
//   const bucketName = process.env.IMAGES_S3_BUCKET
//   const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${ratingId}`
//
//   await ratingAccess.updateAttachmentUrl(ratingId,userId,attachmentUrl)
//
//   const updatedRating = await getRating(userId,ratingId)
//   logger.info(`Fetching updated rating ${JSON.stringify(updatedRating)}`)
//
//   return updatedRating
// }
//
// export async function getS3UploadUrl(imageId: string): Promise<string> {
//
//   const presignedUrl = await imageAccess.getUploadUrl(imageId)
//   logger.info(`Retrieved presigned url from data layer ${presignedUrl}`)
//
//   return presignedUrl
// }
//




