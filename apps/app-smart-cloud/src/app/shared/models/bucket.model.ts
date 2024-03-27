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

export class bucketPolicyDetail {
  subuser: string
  permission: string
  actions: string[]
  sid: string
  typeUser: string
}

export class BucketDetail {
  bucketName: string;
  isVersioning: boolean;
  aclType: string;
  isWebsite: boolean;
  indexDocumentSuffix: string;
  errorDocument: string;
  redirectAllRequestsTo: string;
  checkRedirectAllRequests: boolean;
  linkS3Website: string;
}

export class BucketCors {
  bucketName: string;
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  exposeHeaders: string[];
  maxAgeSeconds: number;
  id: string;
  orderField: number;
}

export class BucketCorsCreate {
  bucketName: string;
  allowedOrigins: string[] = [];
  allowedMethods: string[] = [];
  allowedHeaders: string[] = [];
  exposeHeaders: string[] = [];
  maxAgeSeconds: number;
  id: string;
}

export class BucketWebsite {
  bucketName: string;
  indexDocumentSuffix: string;
  errorDocument: string;
  redirectAllRequestsTo: string;
}

export class DeleteBucketWebsite {
  bucketName: string;
}

export class BucketLifecycle {
  regionId: number;
  customerId: number;
  bucketName: string;
  id: string;
  prefix: string;
  lifecycleTagPredicate: LifecycleTagPredicate[];
  isSetExpiration_Day: boolean;
  lifecycleRuleExpiration_Day: number;
  isSetNoncurrentVersionExpiration_Day: boolean;
  lifecycleRuleNoncurrentVersionExpiration_Day: number;
  isSetAbortIncompleteMultipartUpload_Day: boolean;
  lifecycleRuleAbortIncompleteMultipartUpload_Day: number;
  enabled: boolean;
  lifecycleTagPredicateString: string;
  enabledString: string;
  prefixString: string;
  expiration_DayString: string;
  noncurrentVersionExpiration_DayString: string;
  abortIncompleteMultipartUpload_DayString: string;
  orderField: number;
}

export class LifecycleTagPredicate {
  metaKey: string;
  metaValue: string;
}

export class BucketLifecycleCreate {
  regionId: number;
  customerId: number;
  bucketName: string;
  id: string;
  prefix: string;
  lifecycleTagPredicate: LifecycleTagPredicate[] = [];
  isSetExpiration_Day: boolean;
  lifecycleRuleExpiration_Day: number;
  isSetNoncurrentVersionExpiration_Day: boolean;
  lifecycleRuleNoncurrentVersionExpiration_Day: number;
  isSetAbortIncompleteMultipartUpload_Day: boolean;
  lifecycleRuleAbortIncompleteMultipartUpload_Day: number;
  enabled: boolean;
}
