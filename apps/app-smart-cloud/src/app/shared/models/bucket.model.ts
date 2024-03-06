export class BucketModel {
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
