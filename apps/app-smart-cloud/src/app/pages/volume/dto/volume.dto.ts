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
  expireDate: string;
  deletedDate: string;
  suspendDate: string;
  serviceStatus: string;
  suspendType: string;
  typeId: string;
  backupScheduleId: string;
  vpcId: string;
  vpcName: string;
  isEncryption: boolean;
  isMultiAttach: boolean;
  volumeType: string | null;
  customerEmail: string;
  id: number
}
