export class PackageBackupModel {
  id: number
  sizeInGB: number
  postResizeBackupPacketId: number
  packageName: string
  status: string
  errorLog: string
  customerId: number
  creationDate: Date
  expirationDate: Date
  totalSize: number
  usedSize: number
  description: string
}

export class FormUpdatePackage {
  id: number
  sizeInGB: number
  postResizeBackupPacketId: number
  packageName: string
  status: string
  errorLog: string
}

export class PackageBackupExtend {
  regionId: number
  serviceName: string
  customerId: number
  vpcId: number
  typeName: string
  serviceType: number
  actionType: number
  serviceInstanceId: number
  newExpireDate: Date
  userEmail: string
  actorEmail: string
}
