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
  rulesInfo: RulesInfo[];
}

export interface RulesInfo {
  id: string;
  remoteGroupId: string;
  remoteIpPrefix: string;
  portRangeMax: number;
  portRangeMin: number;
  protocol: string;
  etherType: string;
  direction: string;
  securityGroupId: string;
  portRange: string;
  remoteIp: string;
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

export class Image {
  id: number;
  name: string;
}

export class ImageTypesModel {
  id: number;
  name: string;
  uniqueKey: string;
  images: OfferItem[];
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
  regionId: number;
  customerId: number;
  imageId: number;
  id: number;
}

export class UpdateInstances {
  customerId: number;
  name: string;
  securityGroups: string;
  id: number;
}

export class InstancesModel {
  id: number;
  cloudId: string;
  name: string;
  flavorId: number;
  flavorCloudId: string;
  imageId: number;
  customerId: number;
  ipPublic: string;
  ipPrivate: string;
  cpu: number;
  ram: number;
  storage: number;
  initPassword: string;
  preResizeInstanceId: number;
  regionId: number;
  regionText: string;
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
  taskState: string;
  securityGroupStr: string;
  computeHost: string;
  type: string;
  flavorName: string;
  volumeType: number;
  createdDate: string;
  expiredDate: string;
  totalCount: number;
  imageName: string;
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
  ram: number;
  cpu: number;
  volumeType: any;
  typeName: string;
  customerId: number;
  userEmail: any;
  actorEmail: any;
  vpcId: any;
  regionId: number;
  serviceName: any;
  serviceType: number;
  actionType: number;
  serviceInstanceId: number;
  createDate: string;
  expireDate: string;
  createDateInContract: any;
  saleDept: any;
  saleDeptCode: any;
  contactPersonEmail: any;
  contactPersonPhone: any;
  contactPersonName: any;
  am: any;
  amManager: any;
  note: any;
  isTrial: boolean;
  offerId: number;
  couponCode: any;
  dhsxkd_SubscriptionId: any;
  dSubscriptionNumber: any;
  dSubscriptionType: any;
  oneSMEAddonId: any;
  oneSME_SubscriptionId: any;
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
  couponCode: string;
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

export class InstanceResize {
  description: any;
  currentFlavorId: number;
  newFlavorId: number;
  addBttn: number;
  addBtqt: number;
  storage: number;
  ram: number;
  cpu: number;
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

export class IpCreate {
  id: number;
  duration: number;
  ipAddress: any;
  vmToAttachId: any;
  offerId: number;
  networkId: any;
  useIPv6: any;
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

export class OfferItem {
  id: number;
  productId: number;
  offerName: string;
  price: Price;
  status: string;
  unitOfMeasure: string;
  timePeriod: TimePeriod;
  regions: Region[];
  discounts: any[];
  characteristicValues: CharacteristicValue[];
  description: string;
  ipNumber: string;
}

export class Price {
  fixedPrice: FixedPrice;
  priceType: number;
  chargeType: number;
}

export class FixedPrice {
  amount: number;
  currency: string;
}

export class TimePeriod {
  startDateTime: string;
  endDateTime: any;
}

export class Region {
  id: number;
  offerId: number;
  regionId: number;
}

export class CharacteristicValue {
  id: number;
  charName: string;
  type: number;
  charOptionValues: string[];
  productOfferId: number;
}

export class DataPayment {
  orderItems: ItemPayment[];
  projectId: number;
}

export class ItemPayment {
  orderItemQuantity: number;
  specificationString: string;
  specificationType: string;
  sortItem: number;
  serviceDuration: number;
}

export class InstanceExtend {
  regionId: number;
  serviceName: any;
  customerId: number;
  vpcId: any;
  typeName: string;
  serviceType: number;
  actionType: number;
  serviceInstanceId: number;
  newExpireDate: string;
  userEmail: any;
  actorEmail: any;
}
