export interface BackupVm {
  id: number,
  name: string,
  instanceId: number,
  description: string,
  regionId: number,
  cloudIdentityId: number,
  projectId: number,
  projectName: string,
  status: string,
  scheduleId: number,
  backupPacketId: number,
  systemInfoBackups: SystemInfoBackup[],
  securityGroupBackups: SecurityGroupBackup[],
  serviceStatus: string,
  creationDate: any,
  suspendDate: any,
  suspendType: string,
  vpcName: string,
  customerEmail: string,
  instanceName: string,
  size: number,
  backupPackageName: string,
  volumeBackups: VolumeBackup[],
  expirationDate: any
}

export interface VolumeBackup {
  id: number,
  name: string,
  size: number,
  description: string,
  volumeId: number,
  cloudId: string,
  regionId: number,
  customerId: number,
  scheduleId: number,
  instanceBackupId: number,
  isBootable: true,
  iops: number,
  offerId: number,
  cloudIdentity: number,
  projectName: string,
  projectId: number,
  backupPackageId: number,
  status: string,
  typeName: string
}

export interface SystemInfoBackup {
  id: number,
  instanceBackupId: number,
  ram: number,
  cpu: number,
  rootSize: number,
  flavorName: string,
  osName: string,
  imageId: string
}

export interface SecurityGroupBackup {
  id: number,
  instanceBackupId: number,
  sgName: string,
  protocol: string,
  portMax: number,
  portMin: number,
  direction: string,
  etherType: string,
  remoteIpPrefix: string
}

export class BackupVMFormSearch {
  regionId?: number
  customerId?: number
  projectId?: number
  status?: string
  instanceBackupName?: string
  pageSize?: number
  currentPage?: number
}

export class RestoreFormCurrent {
  instanceBackupId: number
}

export class VolumeAttachment {
  id: number
  cloudId: string
  name: string
  sizeInGB: number
  description: string
  instanceId: number
  postResizeVolumeId: number
  bootable: true
  regionId: number
  regionText: string
  offerId: number
  iops: number
  customerId: number
  createDate: Date
  status: string
  cloudIdentityId: number
  projectName: string
  projectId: number
}

export class BackupPackage {
  id: number
  sizeInGB: number
  postResizeBackupPacketId: number
  packageName: string
  status: string
  errorLog: string
  endDate: Date
}

export class FormCreateBackup {
  instanceId: number
  backupName: string
  backupInstanceOfferId: number
  volumeToBackupIds: number[]
  securityGroupToBackupIds: string[]
  projectId: number
  description: string
  scheduleId: number
  backupPacketId: number
  customerId: number
}

export class CreateBackupVmSpecification {
  instanceId: number
  backupInstanceOfferId: number
  volumeToBackupIds: number[]
  securityGroupToBackupIds: string[]
  description: string
  backupPackageId: number | null
  vpcId: number | null
  customerId: number
  actionType: 0
  regionId: number
  serviceName: string
  serviceType: number
}

export class CreateBackupVmOrderData {
  customerId: number
  createdByUserId: number
  note: string
  orderItems: [
    {
      orderItemQuantity: 1
      specification: string
      specificationType: "instancebackup_create"
      price: 0
      serviceDuration: 1
    }
  ]
}
