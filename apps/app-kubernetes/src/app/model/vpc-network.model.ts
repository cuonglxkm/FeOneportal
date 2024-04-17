export class VPCNetworkModel {

  id: number;
  name: string;
  subnetAddressRequired: string;
  vpcId: number;
  cloudId: string;

}

export class SubnetModel {

  id: number;
  subnetAddressRequired: string;
  subnetCloudId: string;
  networkCloudId: string;
  enableDhcp: boolean;
  gatewayIp: string;
  customerId: number;


}
