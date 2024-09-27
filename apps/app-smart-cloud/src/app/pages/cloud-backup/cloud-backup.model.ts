

export class CloudBackup {
  id: number;
  name: string;
  storage: number | null;
  lIC: string;
  cloudIdVM: string;
  cloudIdVolumeRoot: string;
  cloudIdVolumeAttached: string;
  iPPublic: string;
  status: string;
  region: number | null;
  project: number | null;
  customerId: number | null;
  description: string;
  creationDate: Date;
  expirationDate: Date;
}

export class CreateAccessRule {
  port:number;
  source: string;
}

export class AccessRule {
  id: number;
  port:number;
  source: string;
}

export class CloudBackupExtend {
  regionId: number
  serviceName: string
  customerId: number
  projectId: string
  vpcId: string
  typeName: string
  serviceType: number
  actionType: number
  serviceInstanceId: number
  offerId: number
  newExpireDate: string
  userEmail: string
  actorEmail: string
}

export class CloudBackupResize {
  offerId: number;
  serviceType: number;
  actionType: number;
  serviceInstanceId: number;
  regionId: number;
  currentSize: number;
  newSize: number;
  serviceName: string;
  customerId: number;
  projectId: string;
  vpcId: string;
  typeName: string;
  userEmail: string;
  actorEmail: string;
}