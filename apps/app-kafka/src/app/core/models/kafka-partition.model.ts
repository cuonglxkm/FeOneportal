export class KafkaPartition {
  stt: number;
  partition: number;
  leader: number;
  offset: number;
  size: number;
  ISR: number[];
  replicas: number[];
  activity: string;
}