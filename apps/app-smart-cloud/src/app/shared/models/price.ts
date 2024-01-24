export class OrderItemPrices {
  totalAmount: TotalAmount
  unitPrice: UnitPrice
  quantity: number
  sortItem: number
  duration: number
  remainDays: any
  daysOfMonth: number
  createdDate: Date
  expiredDate: Date
}

export class TotalAmount {
  amount: number
  currency: string
}

export class UnitPrice {
  amount: number
  currency: string
}

export class TotalPayment {
  amount: number
  currency: string
}

export class TotalVAT {
  amount: number
  currency: string
}

export class OrderItem {
  orderItemPrices: OrderItemPrices[]
  totalAmount: TotalAmount
  currentVAT: number
  totalVAT: TotalVAT
  totalPayment: TotalPayment
}
