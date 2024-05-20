export interface BackupVolume {
  id: number
  name: string
  size: number
  description: string
  volumeId: number
  cloudId: string
  regionId: number
  customerId: number
  scheduleId: number
  instanceBackupId: number
  isBootable: true
  iops: number
  offerId: number
  cloudIdentity: number
  projectName: string
  projectId: number
  backupPackageId: number
  status: string
  typeName: string
  volumeName: string
  serviceStatus: string
  creationDate: Date
  expirationDate: Date
  suspendDate: Date
  suspendType: string
  vpcName: string
  customerEmail: string
  backupPackageName: string
}

export class FormCreateBackupVolume {
  volumeId: number
  description: string
  backupPackageId: number
  backupScheduleId: number
  customerId: number
  userEmail: string
  actorEmail: string
  projectId: number
  vpcId: number
  regionId: number
  serviceName: string
  serviceType: number
  actionType: number
  serviceInstanceId: number
  createDate: Date
  expireDate: Date
  createDateInContract: Date
  saleDept: null
  saleDeptCode: null
  contactPersonEmail: null
  contactPersonPhone: null
  contactPersonName: null
  am: null
  amManager: null
  note: null
  isTrial: false
  offerId: number
  couponCode: null
  dhsxkd_SubscriptionId: null
  dSubscriptionNumber: null
  dSubscriptionType: null
  oneSMEAddonId: null
  oneSME_SubscriptionId: null
  isSendMail: true
  typeName: "SharedKernel.IntegrationEvents.Orders.Specifications.VolumeBackupCreateSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null"
}

export class CreateBackupVolumeOrderData {
  customerId: number
  createdByUserId: number
  note: string
  orderItems: [
    {
      orderItemQuantity: 1
      specification: string
      specificationType: 'volumebackup_create'
      price: 0
      serviceDuration: number
    }
  ]
}
