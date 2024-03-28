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
