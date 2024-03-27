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
  quotaShareInGb: number | null;
  status: any; // You may want to replace 'any' with a more specific type if you know the possible values.
  description: string | null;
  publicNetworkId: number | null;
  publicNetworkAddress: string | null;
  quotaIPv6Count: number | null;
}



export class CloudProject {
  id: number
  cloudIdentityId: number
  cloudProjectName: string
  description: string
  regionId: number
  regionText: string
  quotavCpu: number
  quotaRamInGb: number
  quotaHddInGb: number
  quotaSSDInGb: number
  quotaBackupVolumeInGb: number
  quotaSecurityGroupCount: number
  quotaKeypairCount: number
  quotaVolumeSnapshotCount: number
  quotaIpPublicCount: number
  quotaIpFloatingCount: number
  quotaNetworkCount: number
  quotaRouterCount: number
  quotaLoadBalancerSDNCount: number
  quotaShareInGb: number
  quotaShareSnapshotInGb: number
  resourceStatus: string
  publicNetworkId: string
  publicNetworkAddress: string
  quotaIpv6Count: number
  type: string
  displayName: string
}

export class CloudProjectResourceUsed {
  serviceType: number
  cpu: number
  ram: number
  hdd: number
  ssd: number
  backup: number
  securityGroupCount: number
  keypairCount: number
  volumeSnapshotCount: number
  ipPublicCount: number
  networkCount: number
  routerCount: number
  loadBalancerSdnCount: number
  ipv6Count: number
  quotaShareSnapshotInGb: number
}

export class SizeInCLoudProject {
  cloudProject: CloudProject
  cloudProjectResourceUsed: CloudProjectResourceUsed
}
