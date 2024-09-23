export class CloudBackup {
  id: number;
  name: string;
  customerId: number;
  capacity: number;
  status: string;
  createDate: Date;
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