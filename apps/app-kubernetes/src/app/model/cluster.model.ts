export class KubernetesCluster {

  id: number;
  serviceOrderCode: string;
  orderCode: string;
  orderId: number;
  clusterName: string;
  regionId: number;
  namespace: string;
  cloudProfileId: string;
  serviceStatus: number;
  actionStatus: number;
  currentVersion: string;
  upgradeVersion: string[];
  description: string;
  networkType: string;
  apiEndpoint: string;
  cidr: string;
  serviceCidr: string;
  subnet: string;
  vpcNetworkId: number;
  volumeCloudType: string;
  volumeCloudSize: number;
  securityGroupName: string;
  usageTime: number;
  totalNode: number;
  createdDate: Date;
  workerGroup: WorkerGroupModel[];
  offerId: number;
  isProcessing: boolean;

  constructor(obj) {
    this.id = obj.id;
    this.serviceOrderCode = obj.service_order_code;
    this.orderCode = obj.order_code;
    this.orderId = obj.order_id;
    this.clusterName = obj.service_name;
    this.regionId = obj.region_id;
    this.namespace = obj.namespace;
    this.cloudProfileId = obj.cloud_profile_id;
    this.serviceStatus = obj.service_status;
    this.actionStatus = obj.action_status;
    this.apiEndpoint = obj.api_endpoint;
    this.currentVersion = obj.current_version;
    this.upgradeVersion = obj.upgrade_versions_available;
    this.networkType = obj.network_type;
    this.cidr = obj.cidr;
    this.serviceCidr = obj.service_cidr;
    this.subnet = obj.subnet;
    this.securityGroupName = obj.security_group_name;
    this.vpcNetworkId = obj.vpc_network_id;
    this.volumeCloudSize = obj.volume_cloud_size;
    this.volumeCloudType = obj.volume_cloud_type;
    this.usageTime = obj.usage_time;
    this.description = obj.description;
    this.totalNode = obj.total_node;
    this.createdDate = obj.created_date;
    this.offerId = obj.offer_id;
    this.isProcessing = false;

    // get worker groups
    this.workerGroup = [];
    const wgs: [] = obj.worker_groups;
    if (wgs) {
      for (let i = 0; i < wgs.length; i++) {
        const wg = new WorkerGroupModel(wgs[i]);
        this.workerGroup.push(wg);
      }
    }
  }
}

export class CreateClusterReqDto {

  ClusterName: string;
  ProjectId: string;
  ProjectType: number;
  KubernetesVersion: string;
  Description: string;
  CloudProfileId: string;
  ProviderType: string;
  RegionId: string;
  Tenant: string;

  Networking: NetworkReqDto;
  WorkerGroup: WorkerGroupReqDto[];

  // for volume cloud
  VolumeCloudSize: number;
  VolumeCloudType: string;
  UsageTime: number;

  constructor(obj: any) {
    if (obj) {
      this.ClusterName = obj.clusterName;
      this.ProjectId = obj.projectId;
      this.ProjectType = obj.projectType;
      this.KubernetesVersion = obj.kubernetesVersion;
      this.Description = obj.description;
      this.CloudProfileId = obj.cloudProfileId;
      this.ProviderType = obj.providerType;
      this.RegionId = obj.regionId;
      this.Tenant = obj.tenant;

      this.Networking = new NetworkReqDto(obj.networking);

      this.WorkerGroup = [];
      const wgs: [] = obj.workerGroup;
      for (let i = 0; i < wgs.length; i++) {
        const wg = new WorkerGroupReqDto(wgs[i]);
        this.WorkerGroup.push(wg);
      }

      this.VolumeCloudSize = obj.volumeCloudSize;
      this.VolumeCloudType = obj.volumeCloudType;
      this.UsageTime = obj.usageTime;
    }
  }
}

export class NetworkReqDto {

  NetworkType: string;
  VpcNetworkId: number;
  Cidr: string;
  Subnet: string;
  SubnetId: string;
  NetworkCloudId: string;
  SubnetCloudId: string;

  constructor(obj: any) {
    this.NetworkType = obj.networkType;
    this.VpcNetworkId = obj.vpcNetworkId;
    this.Cidr = obj.cidr;
    this.Subnet = obj.subnet;
    this.SubnetId = obj.subnetId;
    this.NetworkCloudId = obj.networkCloudId;
    this.SubnetCloudId = obj.subnetCloudId;
  }
}

export class NetworkingModel {

  networkType: string;
  vpcNetworkId: number;
  cidr: string;
  subnet: string;
  subnetId: string;
  networkCloudId: string;
  subnetCloudId: string;
  serviceCidr: string;

  constructor(obj) {
    if (obj) {
      this.networkType = obj.networkType;
      this.vpcNetworkId = obj.vpcNetworkId;
      this.cidr = obj.podsCidr;
      this.subnet = obj.subnet;
      this.subnetId = obj.subnetId;
      this.networkCloudId = obj.networkCloudId;
      this.subnetCloudId = obj.subnetCloudId;
      this.serviceCidr = obj.serviceCidr;
    }
  }

}

export class UpgradeVersionClusterDto {

  regionId: number;
  clusterName: string;
  namespace: string;
  version: string;
  serviceOrderCode: string;

}

export class UpgradeWorkerGroupDto {

  ServiceOrderCode: string;
  ClusterName: string;
  // VolumeCloudSize: number;
  // VolumeCloudType: string;
  WorkerGroup: WorkerGroupReqDto[];

  constructor(obj: any) {
    if (obj) {
      this.ServiceOrderCode = obj.serviceOrderCode;
      this.ClusterName = obj.clusterName;

      this.WorkerGroup = [];
      let wgs = obj.workerGroup;
      for (let i = 0; i < wgs.length; i++) {
        const wg = new WorkerGroupReqDto(wgs[i]);
        this.WorkerGroup.push(wg);
      }
    }
  }
}

export class WorkerGroupModel {

  id: number;
  workerGroupName: string;
  autoHealing: boolean;
  autoScaling: boolean;
  nodeNumber: number;
  minimumNode: number;
  maximumNode: number;
  volumeType: string;
  volumeTypeName: string;
  volumeTypeId: number;
  volumeSize: number;
  machineTypeName: string;
  machineTypeId: number;
  ram: number;
  cpu: number;

  constructor(obj) {
    if (obj) {
      this.id = obj.id;
      this.workerGroupName = obj.worker_name;
      this.autoHealing = obj.auto_healing;
      this.autoScaling = obj.auto_scaling;
      this.nodeNumber = obj.node_number;
      this.minimumNode = obj.minimum_node;
      this.maximumNode = obj.maximum_node;
      this.volumeType = obj.volume_type;
      this.volumeSize = obj.volume_size;
      this.volumeTypeId = obj.volume_type_id;
      this.machineTypeName = obj.machine_type_name;
      this.machineTypeId = obj.machine_type_id;
      this.volumeTypeName = obj.volume_type_name;
      this.ram = obj.ram;
      this.cpu = obj.cpu;
    }
  }

}

export class WorkerGroupReqDto {

  Id: number;
  WorkerGroupName: string;
  AutoHealing: boolean;
  AutoScalingWorker: boolean;
  MinimumNode: number;
  MaximumNode: number;
  VolumeType: string;
  VolumeTypeId: number;
  VolumeStorage: number;
  ConfigType: string;
  ConfigTypeId: number;
  NodeNumber: number;
  Ram: number;
  Cpu: number;

  constructor(obj) {
    if (obj) {
      this.Id = obj.id;
      this.WorkerGroupName = obj.workerGroupName;
      this.AutoHealing = obj.autoHealing;
      this.AutoScalingWorker = obj.autoScalingWorker;
      this.MinimumNode = obj.minimumNode;
      this.MaximumNode = obj.maximumNode;
      this.VolumeType = obj.volumeType;
      this.VolumeStorage = obj.volumeStorage;
      this.VolumeTypeId = obj.volumeTypeId;
      this.ConfigType = obj.configType;
      this.ConfigTypeId = obj.configTypeId;
      this.NodeNumber = obj.nodeNumber;
      this.Ram = obj.ram;
      this.Cpu = obj.cpu;
    }
  }
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

export class ProgressData {

  namespace: string;
  clusterName: string;

  constructor(obj) {
    if (obj) {
      this.namespace = obj.namespace;
      this.clusterName = obj.clusterName;
    }
  }
}
