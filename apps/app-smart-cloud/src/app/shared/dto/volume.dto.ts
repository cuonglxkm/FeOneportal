export class VolumeDTO {
  cloudId: string;
  name: string;
  sizeInGB: number;
  description: string;
  instanceId: string;
  postResizeVolumeId: string;
  bootable: boolean;
  regionId: number;
  regionText: string;
  offerId: number;
  iops: number;
  customerId: number;
  createDate: string;
  status: string;
  cloudIdentityId: number;
  projectName: string;
  projectId: number;
  project: string | null;
  instanceName: string;
  expirationDate: string;
  creationDate: string;
  deletedDate: string;
  suspendDate: string;
  serviceStatus: string;
  suspendType: string;
  typeId: string;
  backupScheduleId: string;
  vpcId: number;
  vpcName: string;
  isEncryption: boolean;
  isMultiAttach: boolean;
  volumeType: string | null;
  customerEmail: string;
  id: number;
  attachedInstances: AttachedDto[];
}

export class PriceVolumeDto {
  price: number | null;
  tax: number | null;
  totalPrice: number | null;

}
export class CreateVolumeDto{
  volumeType: string;
  volumeSize: number;
  description: string | null;
  instanceToAttachId: number | null;
  isMultiAttach: boolean;
  isEncryption: boolean;
  vpcId: number | null;
  oneSMEAddonId: number |null;
  serviceType: number | null;
  serviceInstanceId: number | null;
  customerId: number | null;
  createDate: string;
  expireDate: string;
  saleDept: any | null;
  saleDeptCode: any | null;
  contactPersonEmail: string | null;
  contactPersonPhone: string | null;
  contactPersonName: string | null;
  note: string | null;
  createDateInContract: string | null;
  am: any | null;
  amManager:any | null;
  isTrial: boolean| null;
  offerId: number;
  couponCode: any | null;
  dhsxkd_SubscriptionId: number | null;
  dSubscriptionNumber: any | null;
  dSubscriptionType: any | null;
  oneSME_SubscriptionId:any | null;
  actionType: number | null;
  regionId: number | null;
  serviceName: string | null;
  typeName: string;
  userEmail: string | null;
  actorEmail: string | null;
  createFromSnapshotId: number | null;
}

export class EditSizeMemoryVolumeDTO{
  newSize: number;
  newDescription: string;
  newOfferId: number;
  serviceType: number;
  actionType: number;
  serviceInstanceId: number;
  regionId: number;
  serviceName: string;
  customerId: number;
  vpcId: number;
  typeName: string;
  userEmail: string;
  actorEmail:string;
}

export class ExtendVolumeDTO{
  regionId: number;
  serviceName: string;
  customerId: number;
  vpcId: number;
  typeName:  string;
  serviceType: number;
  actionType: number;
  serviceInstanceId: number;
  newExpireDate: string;
  userEmail: string;
  actorEmail: string;
}



export class VmDto {
  id: number;
  name: string;
}

export class AttachedDto {
  instanceId: number;
  instanceName: string;
}

export class CreateBackupVolumeSpecification {
  volumeId: number
  description: string
  backupPackageId: number | null
  vpcId: number | null
  customerId: number
  actionType: 0
  regionId: number
  serviceName: string
  serviceType: number
}

export class CreateBackupVolumeOrderData {
  customerId: number
  createdByUserId: number
  note: string
  orderItems: [
    {
      orderItemQuantity: 1
      specification: string
      specificationType: "volumebackup_create"
      price: 0
      serviceDuration: 1
    }
  ]
}