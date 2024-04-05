export class NetWorkModel {
  subnetCloudId: string
  customerId: number
  address: string
  routerExternal: string
  vpcName: string
  id: 3537
  cloudId: string
  name: string
  vlanId: string
  adminState: boolean
  shared: boolean
  type: string
  subnetAddressRequired: string
  status: string
  vpcId: number
  region: number
  regionText: string
  subnets: string
}

export class FormSearchNetwork {
  projectId: number;
  vlanName: string
  networktAddress: string
  region: number
  pageSize: number
  pageNumber: number
}

export class FormSearchPort {
  networkId: string
  region: number
}

export class Port {
  id: string
  name: string
  fixedIPs: string[]
  macAddress: string
  attachedDevice: string
  status: string
  adminStateUp: boolean
  instanceName: string
  subnetId: string[]
  attachedDeviceId: string
}

export class FormSearchSubnet {
  pageSize: number
  pageNumber: number
  region: number
  vlanName: string
  customerId: number
  networkId: number;
}

export class Subnet {
  id: number
  name: string
  ipVersion: number
  gatewayId: string
  enableDhcp: boolean
  hnsNameServer: string
  cloudId: string
  status: string
  networkId: number
  networkCloudId: string
  allocationPools: string
  hostRouters: string
}
