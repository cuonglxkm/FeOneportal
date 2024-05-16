import { Pipe, PipeTransform } from '@angular/core';
import { StatusModel } from '../model/status.model';

@Pipe({
  name: 'statusCode2Label'
})
export class StatusCode2LabelPipe implements PipeTransform {

  transform(status: string): StatusModel {
    switch(status) {
      case 'active':
        return new StatusModel("#008d47", "cluster.instance.running");
      case 'shutoff':
        return new StatusModel("#EA3829", "cluster.instance.stopped");
      case 'reboot':
        return new StatusModel("#FFBB63", "cluster.instance.reboot");

      default:
        return new StatusModel("#4c4f67", "cluster.instance.unknow");
    }

  }

}
