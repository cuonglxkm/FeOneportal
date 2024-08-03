import { Inject, Pipe, PipeTransform } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { StatusModel } from '../models/status.model';

@Pipe({
  name: 'CDNStatusPipe'
})
export class CDNStatusPipe implements PipeTransform {
  constructor(
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) {}

  transform(status: string): StatusModel {
    switch(status?.toLocaleLowerCase()) {
      case "deployed":
        return new StatusModel("#008d47", status);
      case "success":
        return new StatusModel("#008d47", status); 
      default:
        return new StatusModel("#0066B0", status);
    }
  }

}
