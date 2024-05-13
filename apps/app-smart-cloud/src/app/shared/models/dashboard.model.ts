export class SubscriptionsDashboard {
  serviceCount: number
  serviceActiveCount: number
  serviceSuspendCount: number
  serviceExpireCount: number
  serviceNearExpireCount: number
  details: ChartDataSubscription[]
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
  serviceType: number
  serviceName: string
  serviceTypeName: string
  totalAmount: number
  createdDate: string
  status: string
}

export class ChartDataSubscription {
  serviceType: number
  serviceTypeName: string
  dataCount: number
}
