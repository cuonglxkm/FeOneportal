import { Inject, Pipe, PipeTransform } from '@angular/core';
import { StatusModel } from '../core/models/status.model';
import { I18NService } from '../core/i18n/i18n.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
@Pipe({
  name: 'status2ColorPipe'
})
export class Status2ColorPipe implements PipeTransform {
  constructor(
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) {}

  transform(status: number): StatusModel {
    switch(status) {
      case 0:
        return new StatusModel("#FFBB63", this.i18n.fanyi('app.status.not-renew'));
      case 1:
        return new StatusModel("#0066b0", this.i18n.fanyi('app.status.init'));
      case 2:
        return new StatusModel("#008d47", this.i18n.fanyi('app.status.running'));
      case 6: 
        return new StatusModel("#0066B0 ", this.i18n.fanyi('app.status.upgrade'));
      case 7: 
        return new StatusModel("#EA3829", this.i18n.fanyi('app.status.deleting'));
      case 8: 
        return new StatusModel("#EA3829", this.i18n.fanyi('app.status.init-failed'));
      default:
        return new StatusModel("#4c4f67", "Không xác định");
    }

  }

}
