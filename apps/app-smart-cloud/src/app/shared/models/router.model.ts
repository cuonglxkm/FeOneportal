export class RouterModel {
  cloudId: string;
  routerName: string;
  adminState: boolean;
  networkId: string;
  networkName: string;
  networkAddress: string;
  networkType: string;
  vpcId: number;
  vpcName: string;
  regionId: number;
  customerId: number;
  status: string;
  projectId: string;
}

export class RouterCreate {
  customerId: number;
  vpcId: number;
  regionId: number;
  adminState: boolean;
  routerName: string;
  networkId: string;
  projectId: number;
}

export class RouterUpdate {
  id: string;
  customerId: number;
  vpcId: number;
  regionId: number;
  adminState: boolean;
  routerName: string;
  networkId: string;
}

export class RouterInteface {
  id: number;
  cloudId: string;
  subnetName: string;
  networkId: string;
  networkAddress: string;
  subnetCIDR: string;
  subnetCloud: string;
  regionId: number;
  routerId: string;
  ipAddress: string;
  networkCustomer: string;
  subnetId: number;
}

export class RouterIntefaceCreate {
  regionId: number;
  routerId: string;
  ipAddress: string;
  networkCustomer: string;
  subnetId: number;
}

export class StaticRouter {
  routerId: string;
  destinationCIDR: string;
  nextHop: string;
  customerId: number;
  regionId: number;
  vpcId: number;
}

export class FormSearchRouter {
  regionId: number;
  vpcId: number;
  routerName: string;
  status: string;
  pageSize: number;
  currentPage: number;
}

export class Subnet {
  id: number;
  name: string;
  networkAddress: string;
  ipVersion: number;
  gatewayIp: string;
  enableDHCP: true;
  dnsNameServer: string;
  cloudId: string;
  status: string;
  networkId: number;
  networkCloudId: string;
  allocationPools: [
    {
      start: string;
      end: string;
    }
  ];
  hostRouters: [
    {
      destinationCidr: string;
      nextHop: string;
    }
  ];
}
