export class InvoiceModel {
    id: number
    contractCode: string
    customerId: number
    payfreightDate: any
    payfreightUserId: number
    dueDate: any
    toltalAmount: number
    chargeInterval: number
    description: string
    isPaid: true
    contractId: number
    paidDate: any
    paidUserId: number
    discount: number
    collectAmount: number
    invoiceCode: string
    invoiceDetails: InvoiceDetail[]
}

export class InvoiceDetail {
    id: number
    invoiceId: number
    name: string
    startDate: any
    endDate: any
    itemId: number
    serviceType: 1
    unitPrice: number
    quantity: number
    unit: string
    quantityText: string
    usedDays: number
    totalAmount: number
}

export class InvoiceSearch {
    customerId: number
    invoiceCode: string
    pageSize: number
    currentPage: number
}
