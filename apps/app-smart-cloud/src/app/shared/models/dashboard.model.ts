export class SubscriptionsDashboard {
  serviceCount: number
  type: string
  details: DataSubscriptionDashboard[]
}

export class SubscriptionsNearExpire {
  serviceInstanceId: number
  serviceName: string
  serviceTypeName: string
  serviceType: number
  createDate: Date
  expireDate: Date
  status: string
}

export class PaymentCostUse {
  id: number
  paymentCode: string
  serviceTypes: number[]
  serviceName: string
  serviceTypeNames: string[]
  totalAmount: number
  createdDate: string
  status: string
}

export class DataSubscriptionDashboard {
  serviceType: number
  serviceTypeName: string
  dataCount: number
  details: any[]
}

export class DataChart {
  totalAmount: number
  serviceType: number
  typeName: string
}
