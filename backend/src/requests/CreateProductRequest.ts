/**
 * Fields in a request to create a single TODO item.
 */
export interface CreateProductRequest {
  userId: string
  productId: string
  name: string
  purchaseDate: string
  store: string
  stars: number
}
