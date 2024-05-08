export class InstanceModel {

  id: number;
  instanceName: string;
  cloudId: string;
  vCPUs: number;
  ram: number;
  volumeSize: number;
  volumeType: string;
  status: string;
  workerGroupName: string;
  serviceOrderCode: string;
  namespace: string;
  privateIP: string;
  isActive: boolean;
  isProgressing: boolean;

}
