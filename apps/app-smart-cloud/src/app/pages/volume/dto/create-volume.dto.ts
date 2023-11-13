export class CreateVolumeDto{
  volumeType: string;
  volumeSize: number;
  description: string | null;
  instanceToAttachId: number | null;
  isMultiAttach: boolean;
  isEncryption: boolean;
  vpcId: number | null;
  oneSMEAddonId: number |null;
  serviceType: string | null;
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
  offerId: 2;
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

