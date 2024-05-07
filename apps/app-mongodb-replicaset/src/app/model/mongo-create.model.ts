export interface MongoCreateReq {
  serviceName: string;
  version: string;
  description: string;
  regionId: number; 
  vpcId: number;
  cpu: number;
  memory: number;
  storage : number;
  servicePackCode : string;
  duration: number;
  orderId: number;
  actionType: number;
}