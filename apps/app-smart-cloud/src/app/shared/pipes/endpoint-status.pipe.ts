import { Inject, Pipe, PipeTransform } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { StatusModel } from '../models/status.model';

@Pipe({
  name: 'EndpointStatusPipe'
})
export class EndpointStatusPipe implements PipeTransform {
  constructor(
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) {}

  transform(status: string): StatusModel {
    switch(status) {
      case "ACTIVE":
        return new StatusModel("#008d47", this.i18n.fanyi('service.status.success'));
      case "ERROR":
        return new StatusModel("#FFBB63", this.i18n.fanyi('service.status.fail'));
      default:
        return new StatusModel("#4c4f67", this.i18n.fanyi('service.status.unknown'));
    }
  }

}
