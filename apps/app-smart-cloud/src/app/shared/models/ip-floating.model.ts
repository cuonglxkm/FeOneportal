export class IpFloating {
  id: number
  ipAddress: string
  portCloudId: string
  customerId: number
  attachedVmId: number
  region: number
  regionText: string
  createDate: Date
  status: number
  cloudIdentity: number
  projectName: string
  projectId: number
  networkId: string
  iPv6Address: string
  serviceStatus: string
  attachedVm: string
  expiredDate: Date
  resourceStatus: string
  suspendType: string
  typeIP: string
}

export class FormSearchIpFloating {
  projectId: number
  regionId: number
  customerId: number
  ipAddress: string
  instanceName: string
  pageSize: number
  currentPage: number
}
