export interface KafkaCreateReq {
    serviceName: string;
    version: string;
    description: string;
    configType: number;
    servicePackCode: string;
    ram: number;
    cpu: number;
    storage: number;
    brokers: number;
    usageTime: number;
    numPartitions: number;
    defaultReplicationFactor: number;
    minInsyncReplicas: number;
    offsetTopicReplicationFactor: number;
    logRetentionHours: number;
    logSegmentBytes: number
}

export interface KafkaUpdateReq {
    serviceOrderCode: string;
    serviceName: string;
    version: string;
    description: string;
}

export class KafkaUpgradeReq {
    serviceOrderCode: string;
    serviceName: string;
    version: string;
    description: string;
    regionId: string;
    ram: number;
    cpu: number;
    storage: number;
    servicePackCode: string;
    usageTime: number;

    constructor() {
        this.serviceOrderCode = '';
        this.serviceName = '';
        this.version = '';
        this.description = '';
        this.regionId = '1';
        this.ram = 1;
        this.cpu = 1;
        this.storage = 1;
        this.servicePackCode = '';
        this.usageTime = 1;
    }
}

export class KafkaExtend {
    serviceOrderCode: string;
    regionId: number;
    serviceName: string;
    customerId: number;
    vpcId: number;
    typeName: string;
    serviceType: number;
    actionType: number;
    serviceInstanceId: number;
    newExpireDate: string;
    userEmail: string;
    actorEmail: string;
  }
  
