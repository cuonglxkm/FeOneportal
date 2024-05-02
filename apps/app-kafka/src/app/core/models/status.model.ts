export class StatusModel {

  color: string;
  status: string;

  constructor(color: string, status: string) {
    this.color = color;
    this.status = status;
  }

}

export interface KafkaStatus {
  id: number;
  statusName: string;
  statusI18n: string;
  description: string;
}
