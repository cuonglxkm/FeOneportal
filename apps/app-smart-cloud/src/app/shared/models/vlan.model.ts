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
  subnets: Subnet[]
}

export class FormSearchNetwork {
  vlanName: string
  networktAddress: string
  region: number
  pageSize: number
  pageNumber: number
  project: number
}

export class FormSearchPort {
  networkId: string
  region: number
  pageSize: number
  pageNumber: number
  name: string
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
  name: string
  customerId: number
  networkId: number
  vpcId: number;
}



export class Subnet {
  id: number
  name: string
  subnetCloudId: string
  ipVerison: number
  networkCloudId: string
  customerId: number
  mayAoGan: string
  networkId: number
  allocationPools: allocationPool[]
  hostRouters: string
  enableDhcp: boolean
  networkName: string
  gatewayIp: string
  cloudId: string
  vlanId: string
  adminState: boolean
  shared: boolean
  type: string
  subnetAddressRequired: string
  status: string
  vpcId: number
  region: number
  regionText: string
  networkAddress: string
  subnets: Subnet[]
}

export class allocationPool {
  start: string
  end: string
}

export class FormCreateNetwork {
  name: string
  vpcId: number
  regionId: number
  customerId: number
  subnetName: string
  networktAddress: string
  gatewayIP: string
  dnsNameServer: string
  allocationPool: string
  enableDHCP: boolean
  hostRoutes: string
}

export class FormCreateSubnet {
  name: string
  networktAddress: string
  vlanId: number
  region: number
  gatewayIP: string
  allocationPool: string
  dnsNameServer: string
  enableDHCP: boolean
  hostRoutes: string
  customerId: number
}

export class FormUpdateSubnet {
  id: number
  name: string
  gatewayIP: string
  enableDHCP: boolean
  hostRoutes: string
}

export class FormCreatePort {
  subnetId: number
  portName: string
  regionId: number
  customerId: number
  ipAddress: string

}
