export class CloudBackup {
  id: number;
  name: string;
  customerId: number;
  capacity: number;
  status: string;
  createDate: Date;
  createdDate?: Date;
  expiredDate: Date;
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
  newExpireDate: string
  userEmail: string
  actorEmail: string
}

export class CloudBackupResize {
  newOfferId: number;
  serviceType: number;
  actionType: number;
  serviceInstanceId: number;
  regionId: number;
  serviceName: string;
  customerId: number;
  projectId: string;
  vpcId: string;
  typeName: string;
  userEmail: string;
  actorEmail: string;
}