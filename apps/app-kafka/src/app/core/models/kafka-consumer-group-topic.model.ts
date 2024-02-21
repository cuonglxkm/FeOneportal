import { KafkaConsumerGroupTopicDetail } from "./kafka-consumer-group-topic-detail.model";

export class KafkaConsumerGroupTopic {
    
    id: number;
    topicName: string;
    overallLag: number;
    detailTopic: KafkaConsumerGroupTopicDetail[];

}