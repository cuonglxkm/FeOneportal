export class BucketModel {
  bucketName: string;
  endPoints: string;
  size: string;
  createdDate: string;
  aclType: string;
  isVersioning: string;
  status: string;
}

export class BucketPolicy {
  sid: string;
  user: string;
  permission: string;
  action: string[];
}
