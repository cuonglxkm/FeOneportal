export class KubernetesCluster {

  id: number;
  serviceOrderCode: string;
  clusterName: string;
  regionId: number;
  namespace: string;
  cloudProfileId: string;
  serviceStatus: number;
  actionStatus: number;
  currentVersion: string;
  upgradeVersion: string;
  description: string;
  networkType: string;
  autoHealing: boolean;
  autoScaling: boolean;
  apiEndpoint: string;
  cidr: string;
  subnet: string;
  vpcNetworkId: number;
  volumeCloudType: string;
  volumeCloudSize: number;
  usageTime: number;
  totalNode: number;
  createdDate: Date;
  workerGroups: WorkerGroupModel[];
  isProcessing: boolean;

  constructor(obj) {
    this.id = obj.id;
    this.serviceOrderCode = obj.service_order_code;
    this.clusterName = obj.service_name;
    this.regionId = obj.region_id;
    this.namespace = obj.namespace;
    this.cloudProfileId = obj.cloud_profile_id;
    this.serviceStatus = obj.service_status;
    this.actionStatus = obj.action_status;
    this.apiEndpoint = obj.api_endpoint;
    this.currentVersion = obj.current_version;
    this.upgradeVersion = obj.upgrade_version;
    this.networkType = obj.network_type;
    this.autoHealing = obj.auto_healing;
    this.autoScaling = obj.auto_scaling;
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
    this.workerGroups = [];
    const wgs: [] = obj.worker_groups;
    if (wgs) {
      for (let i = 0; i < wgs.length; i++) {
        const wg = new WorkerGroupModel(wgs[i]);
        this.workerGroups.push(wg);
      }
    }
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
  minimumNode: number;
  maximumNode: number;
  volumeType: string;
  volumeSize: number;
  ram: number;
  cpu: number;

  constructor(obj) {
    if (obj) {
      this.workerGroupName = obj.worker_name;
      this.minimumNode = obj.minimum_node;
      this.maximumNode = obj.maximum_node;
      this.volumeType = obj.volume_type;
      this.volumeSize = obj.volume_size;
      this.ram = obj.ram;
      this.cpu = obj.cpu;
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
