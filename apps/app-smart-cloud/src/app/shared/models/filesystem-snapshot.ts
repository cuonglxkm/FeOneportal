export class FormSearchFileSystemSnapshot {
    regionId: number
    customerId: number
    vpcId: number
    isCheckState: boolean
    pageSize: number
    currentPage: number
    name: string
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
  regionId:number;
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

export class OrderExtendFileSystemSnapshot{
  regionId: number
  serviceName: string
  customerId: number
  projectId: number
  vpcId: number
  typeName: string
  serviceType: number
  actionType: number
  serviceInstanceId: number
  newExpireDate: Date
  userEmail: string
  actorEmail: string
}

export class ExtendFileSystemSnapshotRequestModel {
  customerId: number;
  createdByUserId: number;
  note: string;
  couponCode: string;
  orderItems: [
    {
      orderItemQuantity: number
      specification: string
      specificationType: string
      serviceDuration: number
      price: number
    }
  ];
}