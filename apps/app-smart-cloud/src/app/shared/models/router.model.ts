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
  projectId: string;
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

export class RouterStatic {
  routerId: string;
  destinationCIDR: string;
  nextHop: string;
  customerId: number;
  regionId: number;
  vpcId: number;
}
