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
  quotaVolumeSnapshotInGb: number
  quotaIpPublicCount: number
  quotaIpFloatingCount: number
  quotaNetworkCount: number
  quotaRouterCount: number
  quotaLoadBalancerSDNCount: number
  offerId: number
  offerIdLBSDN: number
  vpnSiteToSiteOfferId: number
  quotaShareInGb: number
  quotaShareSnapshotInGb: number
  resourceStatus: string
  publicNetworkId: string
  publicNetworkAddress: string
  quotaIpv6Count: number
  type: string
  displayName: string
  cloudId: string
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
  ipFloatingCount: number
  networkCount: number
  routerCount: number
  loadBalancerSdnCount: number
  ipv6Count: number
  quotaShareInGb: number
  quotaShareSnapshotInGb: number
}

export class SizeInCloudProject {
  cloudProject: CloudProject
  cloudProjectResourceUsed: CloudProjectResourceUsed
  creationDate: Date
  expirationDate: Date
}
