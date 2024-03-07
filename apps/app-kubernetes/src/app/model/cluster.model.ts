export class KubernetesCluster {

  id: number;
  serviceOrderCode: string;
  clusterName: string;
  regionId: string;
  cloudProfileId: string;
  serviceStatus: number;
  actionStatus: number;
  currentVersion: string;
  upgradeVersion: string;
  description: string;
  networkType: string;
  autoHealing: boolean;
  autoScale: boolean;
  apiEndpoint: string;
  cidr: string;
  subnet: string;
  totalNode: number;
  createdDate: Date;
  workerGroups: WorkerGroupModel[];

  constructor(obj) {
    this.id = obj.id;
    this.serviceOrderCode = obj.service_order_code;
    this.clusterName = obj.service_name;
    this.regionId = obj.region_id;
    this.cloudProfileId = obj.cloud_profile_id;
    this.serviceStatus = obj.service_status;
    this.actionStatus = obj.action_status;
    this.apiEndpoint = obj.api_endpoint;
    this.currentVersion = obj.current_version;
    this.upgradeVersion = obj.upgrade_version;
    this.networkType = obj.network_type;
    this.autoHealing = obj.auto_healing;
    this.autoScale = obj.auto_scale;
    this.cidr = obj.cidr;
    this.subnet = obj.subnet;
    this.description = obj.description;
    this.totalNode = obj.total_node;
    this.createdDate = obj.created_date;

    // get worker groups
    this.workerGroups = [];
    const wgs: [] = obj.worker_groups;
    for (let i = 0; i < wgs.length; i++) {
      const wg = new WorkerGroupModel(wgs[i]);
      this.workerGroups.push(wg);
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
      this.workerGroupName = obj.worker_group_name;
      this.minimumNode = obj.minimum_node;
      this.maximumNode = obj.maximum_node;
      this.volumeType = obj.volume_type;
      this.volumeSize = obj.volume_size;
      this.ram = obj.ram;
      this.cpu = obj.cpu;
    }
  }

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
