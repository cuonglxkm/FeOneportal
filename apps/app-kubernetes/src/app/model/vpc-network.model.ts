export class VPCNetworkModel {

  id: number;
  name: string;
  subnetAddressRequired: string;
  vpcId: number;

}

export class SubnetModel {

  id: number;
  subnetAddressRequired: string;
  subnetCloudId: string;
  enableDhcp: boolean;
  gatewayIp: string;
  customerId: number;

}
