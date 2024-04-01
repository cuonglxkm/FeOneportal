import { KafkaTopic } from "./kafka-topic.model"

export interface ListTopicResponse<> {
    data: KafkaTopic[];
    page: number;
    pages: number;
    size: number;
    totals: number;
}