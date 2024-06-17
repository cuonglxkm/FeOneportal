export class ProjectModel {
  id!: number;
  projectName: string;
  projectRegion: number;
  projectRegionText: string;
  cloudIdentityId: number;
  type: number;
  quotavCpu: number;
  quotaRamInGb: number;
  quotaHddInGb: number;
  quotaSSDInGb: number;
  quotaBackupVolumeInGb: number;
  quotaSecurityGroupCount: number;
  quotaKeypairCount: number;
  quotaVolumeSnapshotCount: number;
  quotaIpPublicCount: number;
  quotaNetworkCount: number;
  quotaRouterCount: number;
  quotaLoadBalancerSDNCount: number;
  status: any; // You may want to replace 'any' with a more specific type if you know the possible values.
  description: string;
  publicNetworkId: number;
  publicNetworkAddress: string;
  quotaIPv6Count: number;
}
