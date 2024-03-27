export class StatusModel {

  color: string;
  status: string;

  constructor(color: string, status: string) {
    this.color = color;
    this.status = status;
  }

}

export class ClusterStatus {

  id: number;
  statusName: string;

}
