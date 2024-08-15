import { Inject, Pipe, PipeTransform } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { StatusModel } from '../models/status.model';

@Pipe({
  name: 'ServiceStatusPipe'
})
export class ServiceStatusPipe implements PipeTransform {
  constructor(
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) {}

  transform(status: string): StatusModel {
    switch(status) {
      case "CREATING":
        return new StatusModel("#0066b0", this.i18n.fanyi('service.status.init'));
      case "KHOITAO":
        return new StatusModel("#008d47", this.i18n.fanyi('service.status.active'));
      case "AVAILABLE":
      case "ENABLE":
      case "ACTIVE":
        return new StatusModel("#008d47", this.i18n.fanyi('service.status.active'));
      case "EXTENDING":
        return new StatusModel("#0066B0 ", this.i18n.fanyi('service.status.resizing'));
      case "RESIZING":
        return new StatusModel("#EA3824", this.i18n.fanyi('service.status.extending'));
      case "DELETING":
        return new StatusModel("#EA3829", this.i18n.fanyi('service.status.deleting'));
      case "ERROR_DELETING":
          return new StatusModel("#EA3829", this.i18n.fanyi('service.status.error.deleting'));
      case "ERROR":
        return new StatusModel("#EA3829", this.i18n.fanyi('service.status.error'));
      case "EXPIRED":
        return new StatusModel("#e67300", this.i18n.fanyi('service.status.expired'));
      case "VIOLATION":
        return new StatusModel("#e67300", this.i18n.fanyi('service.status.violation'));
      case "RESTORING":
        return new StatusModel("#513FE7", this.i18n.fanyi('service.status.restoring'));
      case "DISABLED":
        return new StatusModel("#EA3829", this.i18n.fanyi('service.status.disabled'));
      case "DISABLE":
        return new StatusModel("#EA3829", this.i18n.fanyi('service.status.disabled'));
      case "PAUSED":
        return new StatusModel("#E67300", this.i18n.fanyi('service.status.paused'));
      case "PROCESSING":
        return new StatusModel("#0066B0", this.i18n.fanyi('service.status.processing'));
      case "SUSPENDED":
        return new StatusModel("#FFBB63", this.i18n.fanyi('app.suspend'));
      case "TAMNGUNG":
        return new StatusModel("#FFBB63", this.i18n.fanyi('app.suspend'));
      case "HUY":
          return new StatusModel("#EA3829", this.i18n.fanyi('service.status.cancel'));
      case "NORMAL":
          return new StatusModel("#009B4E", this.i18n.fanyi('service.status.normal'))
      case "PENDING EXPIRED":
          return new StatusModel("#FFA100", this.i18n.fanyi('service.status.pending.expired'))
      default:
        return new StatusModel("#4c4f67", this.i18n.fanyi('service.status.unknown'));
    }

  }

}
