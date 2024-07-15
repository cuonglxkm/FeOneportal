import { Inject, Pipe, PipeTransform } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { StatusModel } from '../models/status.model';

@Pipe({
  name: 'ServiceTaskStatePipe',
})
export class ServiceTaskStatePipe implements PipeTransform {
  constructor(@Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {}

  transform(status: string): StatusModel {
    switch (status) {
      case 'SHUTOFF':
      case 'POWERING-OFF':
      case 'REBUILDING':
      case 'RESIZING':
      case 'REBOOT_STARTED':
        return new StatusModel('#ea3829', status);
      case 'DELETED':
        return new StatusModel('#ea3829 ', this.i18n.fanyi('app.disconnected'));
      case 'ACTIVE':
      case 'POWERING-ON':
        return new StatusModel('#008d47', status);
      default:
        return new StatusModel(
          '#ea3829',
          this.i18n.fanyi('service.status.unknown')
        );
    }
  }
}
