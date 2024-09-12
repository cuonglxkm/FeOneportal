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
  localEndpointGroupId: string;
  remoteEnpointGroupId: string;
  preSharedKey: string;
  maximumTransmissionUnit: number;
  deadPeerDetectionAction: string;
  deadPeerDetectionInterval: number;
  deadPeerDetectionTimeout: number;
  initiatorState: string
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

export class FormDeleteVpnConnection {
  id: string
  projectId: number
  regionId: number
}

export class VpnConnectionDetail {
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
  status: string
  localNetwork: []
  remoteNetwork: []
}

export class FormEditVpnConnection{
  id:string;
  customerId: number;
  regionId: number;
  projectId: number;
  name: string;
  ipSecPolicyId: string;
  vpnServiceId: string;
  peerRemoteIp: string;
  peerId: string;
  ikepolicyId: string;
  localEndpointGroupId: string;
  remoteEnpointGroupId: string;
  preSharedKey: string;
  maximumTransmissionUnit: number;
  deadPeerDetectionAction: string;
  deadPeerDetectionInterval: number;
  deadPeerDetectionTimeout: number;
  initiatorState: string
}