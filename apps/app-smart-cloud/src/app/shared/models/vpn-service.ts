export class FormSearchVpnService{
    projectId: number
    regionId: number
    name?: string
    pageSize: number
    currentPage: number
}

export class VPNServiceDetail {
    name: string;
    routerName: string;
    status: string;
    vpnGatway: string;
    id: string;
    description: string;
    customerId: number;
    vpcId: number;
    regionId: number;
  }