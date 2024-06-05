export class FormSearchVpnService {
  projectId: number;
  regionId: number;
  name?: string;
  pageSize: number;
  currentPage: number;
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

export class VpnServiceDTO {
  name: string;
  routerId: string;
  status: string;
  id: string;
  description: string;
  customerId: number;
  projectId: number;
  regionId: number;
  vpnGatway: string;
  routerName: string;
}

export class FormCreateVpnService {
  customerId: number;
  projectId: number;
  regionId: number;
  name: string;
  routerId: string
}

export class FormEditVpnService {
  customerId: number;
  projectId: number;
  regionId: number;
  name: string;
  id: string
}

export class FormDeleteVpnService{
  vpnServiceId: string;
  regionId: number;
  customerId: number;
  projectId: number
}

