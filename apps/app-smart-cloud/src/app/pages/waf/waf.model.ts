export class WafsDTO {
  wafName: string;
  wafPackage: string;
  beginDate: Date;
  endDate: string;
  status: string;
}

export class WAFExtend {
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

export class WAFResize {
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
export class WafDTO{
  id: number;
  name:string;
  package:string;
  begin:Date;
  end:Date;
  status:string;
}

export class WafDetailDTO{
  id: number
  name: string
  policyId: number
  policyName: number
  offerName: string
  offerId: number
  status: string
  customerId: number
  createdDate: Date
  expiredDate: Date
  serviceStatus: string
  suspendType: string
  suspendReason: string
  wafDomains: [
    {
      id: number
      domain: string
      ipPublic: string
      host: string
      port: string
      sslCertId: string
      policyId: number
      status: string
      wafPackageId: number
      customerId: number
      cdnId: string
    }
  ]
}


export class SslCertRequest{
 name: string
 privateKey: string
 certificate: string
}

export interface WafDomain {
  id: number;
  domain: string;
  ipPublic: string;
  host: string;
  port: number | null;
  sslCertId: number | null;
  policyId: number | null;
  status: string;
  wafPackageId: number;
  customerId: number;
  cdnId: number | null;
  message: string;
  resouceStatus: string;
}

export class AddDomainRequest {
  domain: string
  ipPublic: string
  host: string
  port: string
  sslCertId: string | number
  policyId: string | number
  packageId: string | number
}
