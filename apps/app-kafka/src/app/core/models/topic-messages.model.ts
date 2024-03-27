export interface FetchTopicMessages {
  serviceOrderCode: string;
  topic: string;
  partitions?: string;
  from?: number;
  to?: number;
}

export interface TopicMessages{
  index: number
  key: string
  value: string
  timestamp: number
  partition: number
  offset: number
}