export class IpPublicModel {
  id?: number;
  ipAddress?: string;
  portCloudId?: string;
  customerId?: number;
  attachedVmId?: number;
  region?: number;
  regionText?: string;
  createDate?: Date;
  status?: number;
  statusName?: number;
  cloudIdentity?: number;
  projectName?: string;
  projectId?: number;
  networkId?: string;
  iPv6Address?: string;
  serviceStatus?: string;
  regionId?: number;
  useIpv6?: boolean;
  attachedVm: string;
  SuspendType: string;
}
