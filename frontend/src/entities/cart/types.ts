export type CartItem = {
  id: number
  productId: number
  name: string
  price: number
  quantity: number
  subtotal: number
  imageUrl: string | null
}

export type CartState = {
  items: CartItem[]
  total: number
}
