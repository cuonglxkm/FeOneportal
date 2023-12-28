export class PaymentModel {
  id: number
  paymentNumber: string
  amount: number
  currency: string
  orderNumber: string
  createdDate: any
  paymentLatestStatus: string
  statusTransitionHistory: StatusTransitionHistory[]
  invoiceIssuedId: number
}

export class StatusTransitionHistory {
  id: number
  status: string
  transitionTime: any
}

export class PaymentSearch {
  code: string
  status: string
  fromDate: any
  toDate: any
  customerId: number
  pageSize: number
  currentPage: number
}
