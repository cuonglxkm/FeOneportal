import {InstancesModel} from "../../pages/instances/instances.model";
import {VolumeDTO} from "../dto/volume.dto";
import {BackupVm} from "./backup-vm";
import {BackupSchedule} from "./schedule.model";

export class PackageBackupModel {
  id: number
  sizeInGB: number
  postResizeBackupPacketId: number
  packageName: string
  status: string
  errorLog: string
  customerId: number
  creationDate: string
  expirationDate: string
  totalSize: number
  usedSize: number
  description: string
  availableSize: number
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

export class BackupPackageRequestModel {
  customerId: number;
  createdByUserId: number;
  note: string;
  couponCode: string;
  totalPayment: number;
  totalVAT: number;
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

export class FormCreateBackupPackage {
  packageName: string
  description: string
  sizeInGB: number
  vpcId:  string
  oneSMEAddonId: null
  serviceType: number
  serviceInstanceId: number
  customerId: number
  createDate: Date
  expireDate: Date
  saleDept: null
  saleDeptCode: null
  contactPersonEmail: null
  contactPersonPhone: null
  contactPersonName: null
  note: string
  createDateInContract: null
  am: null
  amManager: null
  isTrial: false
  offerId: null
  couponCode: null
  dhsxkd_SubscriptionId: null
  dSubscriptionNumber: null
  dSubscriptionType: null
  oneSME_SubscriptionId: null
  actionType: number
  regionId: number
  serviceName: string
  typeName: string
  userEmail: string
  actorEmail: string
}

export class BackupPackageResponseModel{
  success: boolean;
  code: number;
  data: any;
  message: any;
  errorCode: any;
}

export class FormUpdateBackupPackageModel {
  packageName: string
  description: string
  newSize: number
  newOfferId: number
  serviceType: number
  actionType: number
  serviceInstanceId: number
  regionId: number
  serviceName: string
  customerId: number
  vpcId: string
  typeName: string
  userEmail: string
  actorEmail: string
}

export class FormExtendBackupPackageModel {
  regionId: number
  serviceName: string
  customerId: number
  projectId: number
  vpcId: string
  typeName: string
  serviceType: number
  actionType: number
  serviceInstanceId: number
  newExpireDate: Date
  userEmail: string
  actorEmail: string
}

export class FormUpdate {
  customerId: number
  packageId: number
  packageName: string
  description: string
  regionId: number
}

export class ServiceInPackage {
  instanceBackups: any
  volumeBackups: any
  backupSchedules: BackupSchedule[]
}
