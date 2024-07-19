export class IpPublicModel {
  id?: number;
  ipAddress?: string;
  portCloudId?: string;
  customerId?: number;
  attachedVmId?: number;
  region?: number;
  regionText?: string;
  createDate?: Date;
  expiredDate: Date;
  status?: any;
  statusName?: number;
  cloudIdentity?: number;
  projectName?: string;
  projectId?: number;
  networkId?: string;
  iPv6Address?: string;
  serviceStatus?: string;
  suspendReason: any;
  regionId?: number;
  resourceStatus: any;
  useIpv6?: boolean;
  attachedVm: string;
  SuspendType: string;
}
