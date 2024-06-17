import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'action2label'
})
export class Action2Label implements PipeTransform {

  transform(action: string): string {
    switch(action) {
      case 'UPDATE_REQUEST':
        return 'cluster.log.upgrade-request';

      case 'UPDATE':
      case 'UPDATE_ERROR':
        return 'cluster.log.update';

      case 'CREATION_REQUEST':
        return 'cluster.log.creation-request';

      case 'CREATE':
      case 'CREATE_ERROR':
        return 'cluster.log.creation';

      case 'DELETION_REQUEST':
        return 'cluster.log.deletion-request';

      case 'DELETE':
      case 'DELETE_ERROR':
        return 'cluster.log.deletion';

      case 'CREATE_INBOUND':
        return 'cluster.log.create-inbound';

      case 'CREATE_OUTBOUND':
        return 'cluster.log.create-outbound';

      case 'DELETE_INBOUND':
        return 'cluster.log.delete-inboud';

      case 'DELETE_OUTBOUND':
        return 'cluster.log.delete-outbound';

      case 'EXTEND_SERVICE':
        return 'cluster.log.extend';

      case 'HIBERNATE':
        return 'cluster.log.hibernate';

      case 'RESTORE':
        return 'cluster.status.restoring';

      case 'EDIT':
        return 'cluster.log.edit';

      case 'START':
        return 'cluster.instance.start-action';

      case 'STOP':
        return 'cluster.instance.stop-action';

      case 'REBOOT':
        return 'cluster.instance.reboot-action';

      default:
        return 'cluster.log.unknow';
    }

  }

}
