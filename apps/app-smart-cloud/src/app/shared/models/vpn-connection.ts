export class FormCreateVpnConnection {
  customerId: number;
  regionId: number;
  projectId: number;
  name: string;
  ipSecPolicyId: string;
  vpnServiceId: string;
  peerRemoteIp: string;
  peerId: string;
  ikepolicyId: string;
  localSystemSubnet: string;
  remoteLocalSubnet: string;
  preSharedKey: string;
  maximumTransmissionUnit: number;
  deadPeerDetectionAction: string;
  deadPeerDetectionInterval: number;
  deadPeerDetectionTimeout: number;
  initiatorState: string;
}

export class VpnConnectionDTO {
  id: string;
  name: string;
  ipSecPolicy: string;
  ipSecPolicyId: string;
  ikepolicy: string;
  ikepolicyId: string;
  vpnService: string;
  vpnServiceId: string;
  peerRemoteIp: string;
  peerId: string;
  localEndpointGroupId: string;
  localEndpointGroup: string;
  remoteEnpointGroupId: string;
  remoteEnpointGroup: string;
  preSharedKey: string;
  maximumTransmissionUnit: number;
  deadPeerDetectionAction: string;
  deadPeerDetectionInterval: number;
  deadPeerDetectionTimeout: number;
  initiatorState: string;
  status: string;
}

export class FormSearchVpnConnection {
  projectId: number
  regionId: number
  searchValue?: string
  pageSize: number
  currentPage: number
}
