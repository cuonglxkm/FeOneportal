import {InstancesModel} from "../../pages/instances/instances.model";
import {VolumeDTO} from "../dto/volume.dto";
import {BackupVm} from "./backup-vm";
import {BackupSchedule} from "./schedule.model";

export class PackageSnapshotModel {
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

export class FormSearchPackageSnapshot{
    regionId: number;
    projectId: number;
    packageName: string;
    status: string;
    pageSize: number;
    currentPage: number;
}


export class SnapshotPackageRequestModel {
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

export class FormCreateSnapshotPackage {
  packageName: string
  description: string
  sizeInGB: number
  type: string
  customerId: number
  userEmail: string
  actorEmail: string
  projectId:number
  vpcId:  string
  regionId: number
  serviceName: string
  serviceType: number
  actionType: number
  serviceInstanceId: number
  createDate: Date
  expireDate: Date
  createDateInContract: null
  oneSMEAddonId: null
  saleDept: null
  saleDeptCode: null
  contactPersonEmail: null
  contactPersonPhone: null
  contactPersonName: null
  am: null
  amManager: null
  note: string
  isTrial: false
  offerId: number
  couponCode: null
  dhsxkd_SubscriptionId: null
  dSubscriptionNumber: null
  dSubscriptionType: null
  oneSME_SubscriptionId: null
  typeName: string
}

export class FormUpdateSnapshotPackageModel{
  packageName: string
  description: string
  size: number
  type: string
  customerId: number
  userEmail: string
  actorEmail: string
  projectId:number
  vpcId:  string
  regionId: number
  serviceName: string
  serviceType: number
  actionType: number
  serviceInstanceId: number
  createDate: Date
  expireDate: Date
  createDateInContract: null
  oneSMEAddonId: null
  saleDept: null
  saleDeptCode: null
  contactPersonEmail: null
  contactPersonPhone: null
  contactPersonName: null
  am: null
  amManager: null
  note: string
  isTrial: false
  newOfferId: number
  couponCode: null
  dhsxkd_SubscriptionId: null
  dSubscriptionNumber: null
  dSubscriptionType: null
  oneSME_SubscriptionId: null
  typeName: string
}

