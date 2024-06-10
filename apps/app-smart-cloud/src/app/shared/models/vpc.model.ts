export class VpcModel {
  id: number;
  cloudIdentityId: number;
  cloudProjectName: string;
  description: string;
  offerId: number;
  regionId: number;
  regionText: string;
  quotavCpu: number;
  quotaRamInGb: number;
  quotaHddInGb: number;
  quotaSSDInGb: number;
  quotaBackupVolumeInGb: number;
  quotaSecurityGroupCount: number;
  quotaKeypairCount: number;
  quotaVolumeSnapshotCount: number;
  quotaIpPublicCount: number;
  quotaIpFloatingCount: number;
  quotaNetworkCount: number;
  quotaRouterCount: number;
  quotaLoadBalancerSDNCount: number;
  quotaShareInGb: number;
  quotaShareSnapshotInGb: number;
  resourceStatus: string;
  publicNetworkId: string;
  publicNetworkAddress: string;
  quotaIpv6Count: number;
  vpnSiteToSiteOfferId: string;
  offerIdLBSDN: string;
  type: string;
  displayName: string;
  createDate: string;
  expireDate: string;
  suspendDate: string;
  serviceStatus: string;
  suspendType: string;
  contractCode: string;
  loadBalancerPackageName: string;
  vpnSiteToSiteOfferName: string;
  loadbalancerOfferName:string;
  gpuProjects:any;
  quotaVolumeSnapshotHddInGb:number;
  quotaVolumeSnapshotSsdInGb:number;
  offerDetail:{
    vCpu:number,
    ram:number,
    hdd:number,
    ssd:number,
    ipPublic:number
  }
}

export class TotalVpcResource {
  cloudProject :VpcModel;
  cloudProjectResourceUsed: {
    serviceType: number;
    cpu: number;
    ram: number;
    hdd: number;
    ssd: number;
    backup: number;
    securityGroupCount: number;
    keypairCount: number;
    volumeSnapshotCount: number;
    ipPublicCount: number;
    networkCount: number;
    routerCount: number;
    loadBalancerSdnCount: number;
    ipv6Count: number;
    quotaShareSnapshotInGb: number;
    ipFloatingCount: number;
    quotaShareInGb: number;
  }
}
