export class IPWan {
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
  ipV6Address: string
  serviceStatus: string
  attachedVm: string
  expiredDate: Date
  resourceStatus: string
  suspendType: string
  typeIP: string
  network: string
  fixedIpAddress: string
}

export class FormCreateIpWan {
  networkId: number
  regionId: number
  isFloating: boolean
}

export class FormActionIpWan {
  id: number
  nstanceId: number
  action: string
}
