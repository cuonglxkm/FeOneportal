export class IPSubnetModel {
  id: string;
  displayName: string;
  cidr: string;
  availableIp: string;
  gatewayIp: string;
  networkId: string;
}
export class SHHKeyModel {
  id: string;
  displayName: string;
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

export class UpdateInstances {
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
  imageName: string;
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
  expiredDate: Date;
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

export class InstanceFormSearch {
  searchValue: string;
  status: string;
  isCheckState: boolean;
  fromDate: any;
  toDate: any;
  region: number;
  userId: number;
  pageNumber: number;
  pageSize: number;
  securityGroupId: string;
  projectId: number;
}

export interface Instance {
  id: number;
  cloudId: string;
  name: string;
  flavorId: number;
  flavorName: string;
  customerId: number;
  ipPublic: string;
  ipPrivate: string;
  regionId: number;
  regionText: string;
  createdDate: any;
  cloudIdentityId: number;
  projectName: string;
  projectId: number;
  volumeRootId: number;
  status: string;
  taskState: string;
  securityGroups: string;
}

export class InstanceCreate {
  description: any;
  flavorId: number;
  imageId: number;
  iops: number;
  vmType: any;
  keypairName: any;
  securityGroups: any;
  network: any;
  volumeSize: number;
  isUsePrivateNetwork: boolean;
  ipPublic: any;
  password: any;
  snapshotCloudId: any;
  encryption: boolean;
  isUseIPv6: boolean;
  addRam: number;
  addCpu: number;
  addBttn: number;
  addBtqt: number;
  poolName: any;
  usedMss: boolean;
  customerUsingMss: any;
  typeName: string;
  vpcId: any;
  oneSMEAddonId: any;
  serviceType: number;
  serviceInstanceId: number;
  customerId: number;
  createDate: string;
  expireDate: string;
  saleDept: any;
  saleDeptCode: any;
  contactPersonEmail: any;
  contactPersonPhone: any;
  contactPersonName: any;
  note: any;
  createDateInContract: any;
  am: any;
  amManager: any;
  isTrial: boolean;
  offerId: number;
  couponCode: any;
  dhsxkd_SubscriptionId: any;
  dSubscriptionNumber: any;
  dSubscriptionType: any;
  oneSME_SubscriptionId: any;
  actionType: number;
  regionId: number;
  serviceName: any;
  userEmail: any;
  actorEmail: any;
}

export class VolumeCreate {
  volumeType: any;
  volumeSize: number;
  description: any;
  createFromSnapshotId: any;
  instanceToAttachId: any;
  isMultiAttach: boolean;
  isEncryption: boolean;
  vpcId: any;
  oneSMEAddonId: any;
  serviceType: number;
  serviceInstanceId: number;
  customerId: number;
  createDate: string;
  expireDate: string;
  saleDept: any;
  saleDeptCode: any;
  contactPersonEmail: any;
  contactPersonPhone: any;
  contactPersonName: any;
  note: any;
  createDateInContract: any;
  am: any;
  amManager: any;
  isTrial: boolean;
  offerId: number;
  couponCode: any;
  dhsxkd_SubscriptionId: any;
  dSubscriptionNumber: any;
  dSubscriptionType: any;
  oneSME_SubscriptionId: any;
  actionType: number;
  regionId: number;
  serviceName: any;
  typeName: string;
  userEmail: any;
  actorEmail: any;
}

export class Order {
  customerId: number;
  createdByUserId: number;
  note: string;
  orderItems: any[];
}

export class OrderItem {
  orderItemQuantity: number;
  specification: string;
  specificationType: string;
  price: number;
  serviceDuration: number;
}

export interface InstanceResize {
  description: any;
  currentFlavorId: number;
  newFlavorId: number;
  addRam: number;
  addCpu: number;
  addBttn: number;
  addBtqt: number;
  typeName: string;
  newOfferId: number;
  serviceType: number;
  actionType: number;
  serviceInstanceId: number;
  regionId: number;
  serviceName: any;
  customerId: number;
  vpcId: any;
  userEmail: any;
  actorEmail: any;
}

export class InstanceAttachment {
  cloudId: string;
  name: string;
  sizeInGB: number;
  description: string;
  instanceId: any;
  postResizeVolumeId: any;
  bootable: boolean;
  regionId: number;
  regionText: string;
  offerId: number;
  iops: number;
  customerId: number;
  createDate: string;
  status: string;
  cloudIdentityId: number;
  projectName: string;
  projectId: number;
  id: number;
}

export class Network {
  isExternal: boolean;
  id: string;
  name: string;
  network: any;
  fixedIPs: string[];
  macAddress: string;
  status: string;
  port_security_enabled: boolean;
  security_groups: string[];
  allowAddressPairs: any;
}

export class BlockStorageAttachments {
  attachedInstances: any;
  isMultiAttach: boolean;
  isEncryption: boolean;
  serviceStatus: any;
  creationDate: string;
  expirationDate: string;
  deletedDate: any;
  suspendDate: any;
  suspendType: any;
  vpcName: any;
  volumeType: string;
  customerEmail: any;
  cloudId: string;
  name: string;
  sizeInGB: number;
  description: string;
  instanceId: number;
  postResizeVolumeId: any;
  bootable: boolean;
  regionId: number;
  regionText: string;
  offerId: number;
  iops: number;
  customerId: number;
  createDate: string;
  status: string;
  cloudIdentityId: number;
  projectName: string;
  projectId: number;
  id: number;
}

export class UpdatePortInstance {
  portId: string;
  regionId: number;
  customerId: number;
  vpcId: number;
  securityGroup: any[];
  portSecurityEnanble: boolean;
}
