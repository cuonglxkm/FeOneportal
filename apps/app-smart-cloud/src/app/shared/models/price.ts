export class OrderItemPrices {
  totalAmount: TotalAmount
  unitPrice: UnitPrice
  quantity: number
  sortItem: number
  duration: number
  remainDays: any
  daysOfMonth: number
  details: any
  createdDate: Date
  expiredDate: Date
  unitPricePerDay: {
    amount: number
    currency: string
  }
  unitPricePerHour: UnitPricePerHour
}

export class TotalAmount {
  amount: number
  currency: string
}

export class UnitPrice {
  amount: number
  currency: string
}
export class UnitPricePerHour {
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

export class OrderItemObject {
  orderItemPrices: OrderItemPrices[]
  totalAmount: TotalAmount
  currentVAT: number
  totalVAT: TotalVAT
  totalPayment: TotalPayment

}
