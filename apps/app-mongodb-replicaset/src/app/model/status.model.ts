export class StatusModel {

  color: string;
  status: string;

  constructor(color: string, status: string) {
    this.color = color;
    this.status = status;
  }

}

export interface MongodbStatus {
  id: number;
  status_name: string;
}

