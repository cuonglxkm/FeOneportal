export class NotificationMessageModel {

  status: number;
  content: string;

  constructor(obj) {
    this.status = obj.status;
    this.content = obj.content;
  }

}
