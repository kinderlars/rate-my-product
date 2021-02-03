import * as uuid from 'uuid'
import { createLogger } from '../utils/logger'
import {RatingAccess} from '../dataLayer/ratingAccess';

import {CreateProductRequest} from "../requests/CreateProductRequest";
import {UpdateProductRatingRequest} from "../requests/UpdateProductRatingRequest";
import {ImageAccess} from "../dataLayer/imageAccess";
import {Rating} from '../models/Rating';
import {RatingUpdate} from "../models/RatingUpdate";


const logger = createLogger('todos')
const ratingAccess = new RatingAccess()
const imageAccess = new ImageAccess()

export async function getAllRatings(userId:string): Promise<Rating[]> {
  logger.info('Getting all ratings')
  return ratingAccess.getAllProductRatings(userId)
}

export async function getRating(userId: string, ratingId:string): Promise<Rating> {
  logger.info(`Getting rating ${ratingId} for user ${userId}`)

  return await ratingAccess.getProductRating(userId,ratingId)
}

export async function createProductRating(userId: string, createProductRequest: CreateProductRequest): Promise<Rating> {

  const id = uuid.v4()
  const now = new Date().toISOString()

  const newItem: Rating = {
    userId: userId,
    ratingId: id,
    purchaseDate: now,
    attachmentUrl: null,
    ...createProductRequest
  }

  const result = await ratingAccess.createProductRating(newItem)

  logger.info(`New Todo create ${newItem}`)

  return result
}

export async function deleteTodo(userId: string, ratingId: string): Promise<boolean> {

  const rating = await ratingAccess.getProductRating(userId,ratingId)
  logger.info(`Return values of getTodo ${JSON.stringify(rating)}`)

  if(!rating)
    throw new Error('No item found')

  logger.info(`Todo ${JSON.stringify(rating)} for user ${userId} is prepared for deletion`)

  return await ratingAccess.deleteTodo(ratingId, userId)
}

export async function updateRating(ratingId: string, userId: string, updateProductRatingRequest: UpdateProductRatingRequest):Promise<boolean>{
  logger.info(`Trying to update rating ${ratingId} for user ${userId} with payload ${JSON.stringify(updateProductRatingRequest)}`)

  const rating = await ratingAccess.getProductRating(userId,ratingId)
  logger.info(`RATING ITEM: ${JSON.stringify(rating)}`)

  if(!rating)
    throw new Error('No item found')

  logger.info(`Starting update process`)

  const result = await ratingAccess.updateRating(ratingId,userId,updateProductRatingRequest as RatingUpdate)

  return result

}

export async function updateAttachmentUrl(ratingId: string, userId: string, imageId: string): Promise<Rating>{
  logger.info(`Updating attachment url for image ${imageId} of rating ${ratingId} owned by user ${userId}`)
  const bucketName = process.env.IMAGES_S3_BUCKET
  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${ratingId}`

  await ratingAccess.updateAttachmentUrl(ratingId,userId,attachmentUrl)

  const updatedRating = await getRating(userId,ratingId)
  logger.info(`Fetching updated rating ${JSON.stringify(updatedRating)}`)

  return updatedRating
}

export async function getS3UploadUrl(imageId: string): Promise<string> {

  const presignedUrl = await imageAccess.getUploadUrl(imageId)
  logger.info(`Retrieved presigned url from data layer ${presignedUrl}`)

  return presignedUrl
}





