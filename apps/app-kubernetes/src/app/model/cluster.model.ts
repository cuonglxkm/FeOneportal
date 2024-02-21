export class KubernetesCluster {

  id: number;
  clusterName: string;
  serviceStatus: number;
  actionStatus: number;
  operationStatus: string;
  apiEndpoint: string;
  totalNode: number;
  createdDate: Date;

  constructor(obj) {
    this.id = obj.id;
    this.clusterName = obj.service_name;
    this.serviceStatus = obj.service_status;
    this.actionStatus = obj.action_status;
    this.operationStatus = obj.operation_status;
    this.apiEndpoint = obj.api_endpoint;
    this.totalNode = obj.total_node;
    this.createdDate = obj.created_date;
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
