export class ProjectModel {
  id: number;
  projectName: string;
  projectRegion: number;
  projectRegionText: string;
  cloudIdentityId: number;
  type: number;
  quotavCpu: number | null;
  quotaRamInGb: number | null;
  quotaHddInGb: number | null;
  quotaSSDInGb: number | null;
  quotaBackupVolumeInGb: number | null;
  quotaSecurityGroupCount: number | null;
  quotaKeypairCount: number | null;
  quotaVolumeSnapshotCount: number | null;
  quotaIpPublicCount: number | null;
  quotaNetworkCount: number | null;
  quotaRouterCount: number | null;
  quotaLoadBalancerSDNCount: number | null;
  status: any; // You may want to replace 'any' with a more specific type if you know the possible values.
  description: string | null;
  publicNetworkId: number | null;
  publicNetworkAddress: string | null;
  quotaIPv6Count: number | null;
}
