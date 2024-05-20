export interface KafkaInfor {
    serviceOrderCode: string;
    serviceName: string;
    status: number;
    apacheKafkaVersion: string;
    endPoint: string;
    ram: number;
    cpu:number;
    storage: number;
    servicePackName: string;
    createdDate: Date;
}

export interface KafkaDetail {
    id: number;
    serviceOrderCode: string;
    serviceName: string;
    serviceStatus: number;
    createdUser: string;
    createdName: string;
    updatedUser: string;
    createdDate: Date;
    updatedDate: Date;
    expiryDate: Date;
    version: string;
    servicePackCode: string;
    ram: number;
    cpu: number;
    storage: number;
    usageTime: number;
    description: string;
    regionId: string;
    projectId: string;
    offerId: number;
    offerName: string;
    subnetCloudId: string;
    networkId: number;
    
}



