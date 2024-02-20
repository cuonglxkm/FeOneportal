export class KubernetesCluster {

  id: number;
  clusterName: string;
  serviceStatus: number;
  actionStatus: number;
  apiEndpoint: string;
  totalNode: number;
  createdDate: Date;

  constructor(obj) {
    this.id = obj.id;
    this.clusterName = obj.cluster_name;
    this.serviceStatus = obj.service_status;
    this.actionStatus = obj.action_status;
    this.apiEndpoint = obj.api_endpoint;
    this.totalNode = obj.total_node;
    this.createdDate = obj.created_date;
  }
}
