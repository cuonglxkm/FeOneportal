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
