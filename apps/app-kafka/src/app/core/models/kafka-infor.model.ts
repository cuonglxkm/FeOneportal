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
    version: string;
    servicePackCode: string;
    ram: number;
    cpu: number;
    storage: number;
    description: string;
    
}



