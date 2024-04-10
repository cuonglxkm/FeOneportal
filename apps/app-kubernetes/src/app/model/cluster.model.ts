export class KubernetesCluster {

  id: number;
  serviceOrderCode: string;
  orderCode: string;
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
  subnet: string;
  vpcNetworkId: number;
  volumeCloudType: string;
  volumeCloudSize: number;
  usageTime: number;
  totalNode: number;
  createdDate: Date;
  workerGroup: WorkerGroupModel[];
  isProcessing: boolean;

  constructor(obj) {
    this.id = obj.id;
    this.serviceOrderCode = obj.service_order_code;
    this.orderCode = obj.order_code;
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
    this.subnet = obj.subnet;
    this.vpcNetworkId = obj.vpc_network_id;
    this.volumeCloudSize = obj.volume_cloud_size;
    this.volumeCloudType = obj.volume_cloud_type;
    this.usageTime = obj.usage_time;
    this.description = obj.description;
    this.totalNode = obj.total_node;
    this.createdDate = obj.created_date;
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
  ProjectInfraId: string;
  KubernetesVersion: string;
  Description: string;
  CloudProfileId: string;
  ProviderType: string;
  RegionId: string;

  Networking: NetworkReqDto;
  WorkerGroup: WorkerGroupReqDto[];

  // for volume cloud
  VolumeCloudSize: number;
  VolumeCloudType: string;
  UsageTime: number;

  constructor(obj: any) {
    if (obj) {
      this.ClusterName = obj.clusterName;
      this.ProjectInfraId = obj.projectInfraId;
      this.KubernetesVersion = obj.kubernetesVersion;
      this.Description = obj.description;
      this.CloudProfileId = obj.cloudProfileId;
      this.ProviderType = obj.providerType;
      this.RegionId = obj.regionId;

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

  constructor(obj: any) {
    this.NetworkType = obj.networkType;
    this.VpcNetworkId = obj.vpcNetworkId;
    this.Cidr = obj.cidr;
    this.Subnet = obj.subnet;
  }
}

export class NetworkingModel {

  networkType: string;
  vpcNetworkId: number;
  cidr: string;
  subnet: string;

  constructor(obj) {
    if (obj) {
      this.networkType = obj.networkType;
      this.vpcNetworkId = obj.vpcNetworkId;
      this.cidr = obj.podsCidr;
      this.subnet = obj.subnet;
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

export class WorkerGroupModel {

  workerGroupName: string;
  autoHealing: boolean;
  autoScaling: boolean;
  nodeNumber: number;
  minimumNode: number;
  maximumNode: number;
  volumeType: string;
  volumeTypeName: string;
  volumeSize: number;
  machineTypeName: string;
  ram: number;
  cpu: number;

  constructor(obj) {
    if (obj) {
      this.workerGroupName = obj.worker_name;
      this.autoHealing = obj.auto_healing;
      this.autoScaling = obj.auto_scaling;
      this.nodeNumber = obj.node_number;
      this.minimumNode = obj.minimum_node;
      this.maximumNode = obj.maximum_node;
      this.volumeType = obj.volume_type;
      this.volumeSize = obj.volume_size;
      this.machineTypeName = obj.machine_type_name;
      this.volumeTypeName = obj.volume_type_name;
      this.ram = obj.ram;
      this.cpu = obj.cpu;
    }
  }

}

export class WorkerGroupReqDto {

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


  constructor(obj) {
    if (obj) {
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
