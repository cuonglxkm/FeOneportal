export class PaymentModel {
  id: number
  paymentNumber: string
  amount: number
  currency: string
  orderNumber: string
  createdDate: string
  paymentLatestStatus: string
  vat: number
  totalAmount: number
  paymentMethod: string
  paymentUrl: string
  statusTransitionHistory: StatusTransitionHistory[]
  invoiceIssuedId: number;
  eInvoiceCode: number;
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
