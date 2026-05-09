export type Category = {
  id: number
  name: string
}

export type Product = {
  id: number
  categoryId: number
  name: string
  description: string
  price: number
  imageUrl: string | null
  power: number | null
  socketType: string | null
  colorTemp: number | null
  lifespan: number | null
  stock: number
  isActive: boolean
}
