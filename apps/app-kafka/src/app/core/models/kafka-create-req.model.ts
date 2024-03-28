export class KafkaCreateReq {
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

    constructor() {
        this.serviceName = '';
        this.version =  '';
        this.description = '';
        this.configType = 0;
        this.servicePackCode = '';
        this.ram = 0;
        this.cpu = 0;
        this.storage = 0;
        this.brokers = 3;
        this.usageTime = 1;
        this.numPartitions = 0;
        this.defaultReplicationFactor = 0;
        this.minInsyncReplicas = 0;
        this.offsetTopicReplicationFactor = 0;
        this.logRetentionHours = 0;
        this.logSegmentBytes = 0;
    }
}

export class KafkaUpdateReq {
    serviceOrderCode: string;
    serviceName: string;
    version: string;
    description: string;

    constructor() {
        this.serviceOrderCode = '';
        this.serviceName = '';
        this.version =  '';
        this.description = '';
    }
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
    }
}
