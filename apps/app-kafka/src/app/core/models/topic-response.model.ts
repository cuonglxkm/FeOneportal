import { KafkaTopic } from "./kafka-topic.model"

export interface ListTopicResponse<> {
    results: KafkaTopic[];
    page: number;
    pages: number;
    size: number;
    totals: number;
}