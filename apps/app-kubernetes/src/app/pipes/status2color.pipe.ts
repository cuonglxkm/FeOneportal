import { Pipe, PipeTransform } from '@angular/core';
import { StatusModel } from '../model/status.model';

@Pipe({
  name: 'status2ColorPipe'
})
export class Status2ColorPipe implements PipeTransform {

  transform(status: number): StatusModel {
    switch(status) {
      case 0:
        return new StatusModel("#FFBB63", "cluster.status.not-yet-extend");
      case 1:
        return new StatusModel("#0066b0", "cluster.status.initialing");
      case 2:
        return new StatusModel("#008d47", "cluster.status.running");
      case 6:
        return new StatusModel("#0066b0", "cluster.status.upgrading");
      case 7:
        return new StatusModel("#EA3829", "cluster.status.deleting");
      case 11:
        return new StatusModel("#EA3829", "cluster.status.failed");

      default:
        return new StatusModel("#4c4f67", "cluster.status.unknow");
    }

  }

}
