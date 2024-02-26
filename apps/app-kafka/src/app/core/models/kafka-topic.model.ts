export class KafkaTopic {
    topicName: string;
    sizeTopic: number;
    sumMessage: number;
    partitions: number;
    replicas: number;
    outOfSync: number;
    isConfig: number;
    configs: string;
    constructor(obj: any) {
        this.parse(obj);
    }
    parse(obj: any) {
        this.topicName = obj.topic_name;
        this.sizeTopic = obj.size_topic;
        this.partitions = obj.partitions;
        this.replicas = obj.replicas;
        this.outOfSync = obj.out_of_sync;
        this.sumMessage = obj.sum_message;
        this.isConfig = obj.is_config;
        this.configs = obj.configs
    }
}