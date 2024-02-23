export class KafkaMessage {
  offset: number;
  partition: number;
  timestamp: string;
  key: string;
  value: string;
  constructor(obj: any) {
    this.parse(obj);
  }
  parse(obj: any) {
    this.offset = obj.offset;
    this.partition = obj.partition;
    this.timestamp = obj.timestamp;
    this.key = obj.key;
    this.value = obj.value;
  }
}