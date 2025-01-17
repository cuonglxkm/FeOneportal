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
  network: string
  fixedIpAddress: string
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

export class FormCreateIp {
  networkId: number
  regionId: number
  isFloating: boolean
}

export class FormAction {
  id: number
  action: string
  portId: string
}
