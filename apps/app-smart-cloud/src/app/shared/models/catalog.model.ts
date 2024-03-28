export class Product {
  id: number
  name: string
  description: string
  uniqueName: string
  properties: Properties[]
}

export class Properties {
  id: number
  name: string
  productId: number
  isShow: boolean
}
