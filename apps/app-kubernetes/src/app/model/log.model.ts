export class LogModel {
  note: string;
  operation: string;
  opTime: number;
  resource: string;
  resourceType: string;
  userAction: string;

  constructor(obj: any) {
    if (obj) {
      this.note = obj.note;
      this.operation = obj.operation;
      this.opTime = obj.op_time;
      this.resource = obj.resource;
      this.resourceType = obj.resource_type;
      this.userAction = obj.user_action;
    }
  }
}
