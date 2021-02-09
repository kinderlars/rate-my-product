import { apiEndpoint } from '../config'
import Axios from 'axios'
import {Rating} from "../types/Rating";
import {CreateProductRatingRequest} from "../types/CreateProductRatingRequest";
import {UpdateProductRatingRequest} from "../types/UpdateProductRatingRequest";

export async function getRatings(idToken: string): Promise<Rating[]> {
  console.log('Fetching ratings')

  const response = await Axios.get(`${apiEndpoint}/products/ratings`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Ratings:', response.data)
  return response.data.items
}

export async function createRating(
  idToken: string,
  productId: string,
  newRating: CreateProductRatingRequest
): Promise<Rating> {
  const response = await Axios.post(`${apiEndpoint}/products/${productId}/ratings`,  JSON.stringify(newRating), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchRating(
  idToken: string,
  ratingId: string,
  updatedRating: UpdateProductRatingRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/products/ratings/${ratingId}`, JSON.stringify(updatedRating), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteRating(
  idToken: string,
  ratingId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/products/ratings/${ratingId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  productId: string,
  ratingId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/products/${productId}/${ratingId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
