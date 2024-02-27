export class KafkaConsumerGroup {
    serviceOrderCode: string;
    cgName: string;
    members: number;
    topics: number;
    overallLag: number;
    coordinatorInfo: string;
    stateConsumer: string;

}

export class KafkaConsumerGroupTopic {
    
    id: number;
    topicName: string;
    overallLag: number;
    detailTopic: KafkaConsumerGroupTopicDetail[];

}

export class KafkaConsumerGroupTopicDetail {
    
    partitionName: number;
    consumerId: string;
    hostInfo: string;
    lag: number;
    currentOffset: number;
    endOffset: number;

}

export class KafkaConsumerGroupDetail {
    serviceOrderCode: string;
    cgName: string;
    members: number;
    topics: number;
    overallLag: number;
    coordinatorInfo: string;
    stateConsumer: string;
    partitions: number;

}