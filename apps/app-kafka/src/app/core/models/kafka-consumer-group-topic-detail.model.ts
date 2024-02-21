export class KafkaConsumerGroupTopicDetail {
    
    partitionName: number;
    consumerId: string;
    hostInfo: string;
    lag: number;
    currentOffset: number;
    endOffset: number;

}