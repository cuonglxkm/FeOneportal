export class SubscriptionsDashboard {
  serviceCount: number
  serviceActiveCount: number
  serviceSuspendCount: number
  serviceExpireCount: number
  serviceNearExpireCount: number
}

export class SubscriptionsNearExpire {
  id: number
  serviceType: number
  serviceInstanceId: number
  consumerId: number
  createDate: string
  serviceStatus: string
  createUserUniqueId: number
  expireDate: string
  suspendDate: string
  suspendUserUniqueId: number
  deleteDate: string
  deleteUserUniqueId: number
  offerId: number
  saleDept: string
  saleDeptCode: string
  saler: string
  seller2: string
  couponCode: string
  transactionId: string
  createDateInContract: string
  contactPersonName: string
  contactPersonEmail: string
  contactPersonPhone: string
  dSubscriptionNumber: string
  dSubscriptionType: string
  note: string
  oneSME_SubscriptionId: number
  dhsxkd_SubscriptionId: string
  isTrial: boolean
  projectId: number
  oneSMEAddonId: number
  suspendType: string
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
