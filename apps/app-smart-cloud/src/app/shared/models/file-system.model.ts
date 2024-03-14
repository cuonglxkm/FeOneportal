export class FileSystemModel {
  id: number
  name: string
  type: string
  protocol: string
  size: number
  projectId: number
  projectName: string
  cloudId: string
  cloudIdentityId: number
  regionId: number
  regionText: string
  postResizeShareId: number
  status: string
  taskState: string
  expiredDate: Date
  createDate: Date
  customerId: number
  email: string
  description: string
  statusDisplay: string
}

export class FormSearchFileSystem {
  regionId: number
  vpcId: number
  name: string
  isCheckState: boolean
  pageSize: number
  currentPage: number
}

export class FormEditFileSystem {
  id: number
  name: string
  description: string
  regionId: number
  customerId: number
}

export class FileSystemDetail {
  id: number
  shareCloudId: string
  name: string
  type: string
  shareProto: string
  vpc: string
  vpcId: number
  mountTargetAddress: string
  status: string
  createdDate: Date
  size: number
  description: string
  instanceId: string
  customerId: number
  customerEmail: string
}

export class OrderCreateFileSystem {
  projectId: number
  shareProtocol: string
  size: number
  name: string
  description: string
  displayName: string
  displayDescription: string
  shareType: string
  snapshotId: string
  isPublic: false
  shareGroupId: string
  metadata: string
  shareNetworkId: string
  availabilityZone: string
  schedulerHints: string
  actorId: number
  vpcId: number
  customerId: number
  userEmail: string
  actorEmail: string
  regionId: number
  serviceName: string
  serviceType: number
  actionType: number
  serviceInstanceId: number
  createDate: string
  expireDate: string
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
  typeName: "SharedKernel.IntegrationEvents.Orders.Specifications.ShareCreateSpecificationSharedKernel.IntegrationEvents Version=1.0.0.0 Culture=neutral PublicKeyToken=null"
}

export class CreateFileSystemRequestModel {
  customerId: number;
  createdByUserId: number;
  note: string;
  couponCode: string
  orderItems: [
    {
      orderItemQuantity: number;
      specification: string;
      specificationType: string;
      price: number;
      serviceDuration: number;
    }
  ];
}

export class CreateFileSystemResponseModel{
  success: boolean;
  code: number;
  data: any;
  message: any;
  errorCode: any;
}

export class FormDeleteFileSystem {
  id: number
  regionId: number
}


