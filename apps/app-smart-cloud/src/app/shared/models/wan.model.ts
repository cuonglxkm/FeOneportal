export class WanIP {
  id: number
  wanName: string
  ipAddress: string
  vpcName: string
  vpcId: number
  attachedVmName: string
  customerId: number
  regionId: number
  attachedVmId: number
}

export class FormSearch {
  regionId: number
  childChannels: number
  customerId: number
  ipAddress: string
  instanceName: string
  netName: string
  projectId: number
  pageSize: number
  currentPage: number
}

export class FormCreate {
  networkId: number
  regionId: number
  isFloating: boolean //false
  ipAddress: string
}

export class FormAction {
  id: number
  instanceId: number
  action: string
}
