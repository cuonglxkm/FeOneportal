export class BackupVm {
  id: number;
  name: string;
  instanceId: number;
  description: string;
  regionId: number;
  cloudIdentityId: number;
  projectId: number;
  projectName: string;
  status: string;
  scheduleId: number;
  backupPacketId: number;
  customerId: number;
  systemInfoBackups: SystemInfoBackup[];
  securityGroupBackups: SecurityGroupBackup[];
  serviceStatus: string;
  creationDate: string;
  expirationDate: string;
  suspendDate: string;
  suspendType: string;
  suspendReason: string;
  vpcName: string;
  customerEmail: string;
  instanceName: string;
  size: number;
  backupPackageName: string;
  volumeBackups: VolumeBackup[];
}

export class SystemInfoBackup {
  instanceBackupId: number;
  ram: number;
  cpu: number;
  rootSize: number;
  flavorName: string;
  osName: string;
  imageId: string;
  imageIdInt: number;
}

export class SecurityGroupBackup {
  id: number;
  instanceBackupId: number;
  sgName: string;
  protocol: string;
  portMax: number;
  portMin: number;
  direction: string;
  etherType: string;
  remoteIpPrefix: string;
}

export class VolumeBackup {
  id: number;
  name: string;
  size: number;
  description: string;
  volumeId: number;
  cloudId: string;
  regionId: number;
  customerId: number;
  scheduleId: number;
  instanceBackupId: number;
  isBootable: boolean;
  iops: number;
  offerId: number;
  cloudIdentity: number;
  projectName: string;
  projectId: number;
  backupPackageId: number;
  status: string;
  typeName: string;
  volumeType: string;
  isMultiAttach: boolean;
  isEncryption: boolean;
}

export class BackupVMFormSearch {
  regionId?: number;
  customerId?: number;
  projectId?: number;
  status?: string;
  instanceBackupName?: string;
  pageSize?: number;
  currentPage?: number;
}

export class RestoreFormCurrent {
  instanceBackupId: number;
  securityGroups: string[];
  volumeBackupIds: number[];
}

export class VolumeAttachment {
  id: number;
  cloudId: string;
  name: string;
  sizeInGB: number;
  description: string;
  instanceId: number;
  postResizeVolumeId: number;
  bootable: true;
  regionId: number;
  regionText: string;
  offerId: number;
  iops: number;
  customerId: number;
  createDate: Date;
  status: string;
  cloudIdentityId: number;
  projectName: string;
  projectId: number;
}

export class BackupPackage {
  id: number;
  sizeInGB: number;
  postResizeBackupPacketId: number;
  packageName: string;
  status: string;
  errorLog: string;
  endDate: Date;
}

export class FormCreateBackup {
  instanceId: number;
  backupName: string;
  backupInstanceOfferId: number;
  volumeToBackupIds: number[];
  securityGroupToBackupIds: string[];
  projectId: number;
  description: string;
  scheduleId: number;
  backupPacketId: number;
  customerId: number;
}

export class CreateBackupVmSpecification {
  instanceId: number;
  backupInstanceOfferId: number;
  volumeToBackupIds: number[];
  securityGroupToBackupIds: string[];
  description: string;
  backupPackageId: number;
  backupScheduleId: number;
  customerId: number;
  userEmail: string;
  actorEmail: string;
  projectId: number;
  vpcId: number;
  regionId: number;
  serviceName: string;
  serviceType: number;
  actionType: number;
  serviceInstanceId: number;
  createDate: Date;
  expireDate: Date;
  createDateInContract: null;
  saleDept: null;
  saleDeptCode: null;
  contactPersonEmail: null;
  contactPersonPhone: null;
  contactPersonName: null;
  am: null;
  amManager: null;
  note: null;
  isTrial: false;
  offerId: number;
  couponCode: null;
  dhsxkd_SubscriptionId: null;
  dSubscriptionNumber: null;
  dSubscriptionType: null;
  oneSMEAddonId: null;
  oneSME_SubscriptionId: null;
  isSendMail: true;
  typeName: 'SharedKernel.IntegrationEvents.Orders.Specifications.InstanceBackupCreateSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null';
}

export class CreateBackupVmOrderData {
  customerId: number;
  createdByUserId: number;
  note: string;
  orderItems: [
    {
      orderItemQuantity: 1;
      specification: string;
      specificationType: 'instancebackup_create';
      price: 0;
      serviceDuration: number;
    }
  ];
}

export class FormUpdateBackupVm {
  instanceBackupId: number;
  name: string;
  description: string;
}

export class RestoreInstanceBackup {
  instanceBackupId: number;
  volumeBackups: VolumeExternalBackup[];
  instanceName: any;
  securityGroups: any;
  subnetCloudId: any;
  offerFlavorId: number;
  keypairName: any;
  volumeSize: number = 0;
  isUsePrivateNetwork: boolean;
  ipPublic: any;
  password: any;
  encryption: boolean;
  ram: number = 0;
  cpu: number = 0;
  gpuCount: any = 0;
  gpuTypeOfferId: any;
  privateNetId: any;
  privatePortId: any;
  projectId: any;
  customerId: number;
  serviceType: number;
  serviceInstanceId: number;
  createDate: string;
  expireDate: string;
  saleDept: any;
  saleDeptCode: any;
  contactPersonEmail: any;
  contactPersonPhone: any;
  contactPersonName: any;
  note: any;
  createDateInContract: any;
  am: any;
  amManager: any;
  isTrial: boolean;
  offerId: number;
  couponCode: any;
  dhsxkd_SubscriptionId: any;
  dSubscriptionNumber: any;
  dSubscriptionType: any;
  oneSME_SubscriptionId: any;
  oneSMEAddonId: any;
  userEmail: any;
  actorEmail: any;
  actionType: number;
  regionId: number;
  serviceName: any;
  typeName: string;
}

export class VolumeExternalBackup {
  id: number;
  name: string;
  size: number;
}
