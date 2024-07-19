import { Inject, Pipe, PipeTransform } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';

@Pipe({
  name: 'SuspendStatusPipe'
})



export class SuspendStatusPipe implements PipeTransform {
  constructor(
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) {}
  transform(protocol: string): string {
    switch(protocol) {
      case 'CHAMGIAHAN':
        return this.i18n.fanyi('app.status.low-renew');
      case "VIPHAMDIEUKHOAN":
        return this.i18n.fanyi('service.status.violation')
      default:
        return 'Chưa rõ lí do';
    }
  }

}
