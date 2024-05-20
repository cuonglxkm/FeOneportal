export class FormSearchFileSystemSnapshot {
    regionId: number
    customerId: number
    vpcId: number
    isCheckState: boolean
    pageSize: number
    currentPage: number
  }

  export class FormCreateFileSystemSnapShot {
    name: string
    description: string
    projectId: string
    shareId: number
    force: boolean
    displayName: string
    displayDescription: string
    vpcId: number
    customerId: number
    region: number
    scheduleId: number
    size: number
    }

export class FormEditFileSystemSnapShot{
  id: number;
  name: string;
  description: string;
  vpcId: number;
  regionId: number;
  customerId: number
}

export class FormDeleteFileSystemSnapshot{
  id:number;
  customerId: number;
}

export class OrderCreateFileSystemSnapshot{
    name: string
    description: string
    projectId: number
    shareId: number
    force: false
    displayName: string
    displayDescription: string
    customerId: number
    region: number
    scheduleId: string
    userEmail: string
    actorEmail: string
    vpcId: string
    regionId: number
    serviceName: string
    serviceType: number
    actionType: number
    serviceInstanceId: number
    createDate: Date
    expireDate: Date
    createDateInContract: string
    saleDept: string
    saleDeptCode: string
    contactPersonEmail: string
    contactPersonPhone: string
    contactPersonName: string
    am: string
    amManager: string
    note: string
    isTrial: false
    offerId: number
    couponCode: string
    dhsxkd_SubscriptionId: string
    dSubscriptionNumber: string
    dSubscriptionType: string
    oneSMEAddonId: string
    oneSME_SubscriptionId: string
    isSendMail: true
    typeName: string
}