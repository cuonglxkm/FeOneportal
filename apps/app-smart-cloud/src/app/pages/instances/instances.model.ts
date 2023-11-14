export class IPSubnetModel {
  id:          string;
  displayName: string;
  cidr:        string;
  availableIp: string;
  gatewayIp:   string;
  networkId:   string;
}


export class SecurityGroupModel {
  tenantId: string;
  regionId: number;
  id: string;
  name: string;
  description: string;
  // rulesInfo:   any;
}

export class IPPublicModel {
  ipAddress: string;
  portCloudId: string;
  customerId: number;
  attachedVmId: null;
  region: number;
  regionText: string;
  createDate: Date;
  status: number;
  cloudIdentity: number;
  projectName: string;
  projectId: number;
  networkId: string;
  iPv6Address: null;
  serviceStatus: null;
  id: number;
}

export class Flavors {
  cloudId: string;
  flavorName: string;
  price: number;
  price3Months: number;
  price6Months: number;
  price12Months: number;
  price24Months: number;
  priceSSD: number;
  cpu: number;
  ram: number;
  hdd: number;
  bttn: number;
  btqt: number;
  region: number;
  regionText: string;
  isBasic: boolean;
  show: boolean;
  isVpc: boolean;
  isDeleted: null;
  description: string;
  systemFlavorDetail: null;
  id: number;
}

export class Images {
  name: string;
  imageTypeId: number;
  cloudId: string;
  flavorId: number;
  show: number;
  regionId: number;
  regionText: string;
  status: string;
  isLicense: boolean;
  isForAllUser: boolean;
  id: number;
}

export class ImageTypesModel {
  name: string;
  uniqueKey: string;
  id: number;
  isChecked: boolean = false;
  items: Images[] = [];
  versionId: any;
}

export class Snapshot {
  name: string;
  imageTypeId: number;
  cloudId: string;
  flavorId: number;
  show: number;
  regionId: number;
  regionText: string;
  status: string;
  isLicense: boolean;
  isForAllUser: boolean;
  id: number;
}
export enum RegionText {
  Hcm = 'HCM',
  HàNội1 = 'Hà Nội 1',
}

export enum Status {
  Huy = 'HUY',
  Khoitao = 'KHOITAO',
}

export class RebuildInstances {
  regionId: number = 0;
  customerId: number = 0;
  imageId: number = 0;
  flavorId: number = 0;
  volumeType: number = 0;
  iops: number = 0;
  id: number = 0;
}

export interface UpdateInstances {
  regionId: number;
  customerId: number;
  imageId: number;
  flavorId: number;
  duration: number;
  name: string;
  storage: number;
  projectId: number;
  securityGroups: string;
  listServicesToBeExtended: string;
  newExpiredDate: string;
  id: number;
}

export class CreateInstances {
  regionId: number;
  currentNetworkCloudId: string;
  useIPv6: boolean;
  customerId: number;
  usePrivateNetwork: boolean;
  imageId: number;
  flavorId: number;
  name: string;
  storage: number;
  projectId: number;
  snapshotCloudId: string;
  listSecurityGroup: string[];
  keypair: string;
  domesticBandwidth: number;
  intenationalBandwidth: number;
  ramAdditional: number;
  cpuAdditional: number;
  bttnAdditional: number;
  btqtAdditional: number;
  initPassword: string;
  ipPrivate: string;
}

export class InstancesModel {
  cloudId: string;
  name: string;
  flavorId: number;
  flavorName: string;
  flavorCloudId: string;
  imageId: number;
  customerId: number;
  ipPublic: string;
  ipPrivate: null;
  cpu: number;
  ram: number;
  storage: number;
  initPassword: string;
  preResizeInstanceId: number;
  regionId: number;
  regionText: string;
  createdDate: Date;
  cloudIdentityId: number;
  projectName: string;
  projectId: number;
  bttn: number;
  btqt: number;
  ramAdditional: number;
  cpuAdditional: number;
  bttnAdditional: number;
  btqtAdditional: number;
  volumeRootId: number;
  status: string;
  taskState: null;
  project: null;
  id: number;
}
