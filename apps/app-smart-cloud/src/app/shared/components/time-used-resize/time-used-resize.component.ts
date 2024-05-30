import { Component, Inject, Input } from '@angular/core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-time-used-resize',
  templateUrl: './time-used-resize.component.html',
  styleUrls: ['./time-used-resize.component.less'],
})
export class TimeUsedResizeComponent {
  @Input() expireDate: any
  @Input() createDate: any

  constructor(@Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
  }

  getMonthDifference(expiredDateStr: string, createdDateStr: string): { months: number, days: number } {
    // Chuyển đổi chuỗi thành đối tượng Date
    const expiredDate = new Date(expiredDateStr);
    const createdDate = new Date(createdDateStr);

    // Tính số tháng giữa hai ngày
    const oneDay = 24 * 60 * 60 * 1000; // Số mili giây trong một ngày
    const diffDays = Math.round(Math.abs((expiredDate.getTime() - createdDate.getTime()) / oneDay)); // Số ngày chênh lệch
    const diffMonths = Math.floor(diffDays / 30); // Số tháng dựa trên số ngày, mỗi tháng có 30 ngày
    const remainingDays = diffDays % 30;
    return {
      months: diffMonths,
      days: remainingDays
    };
  }

  getFormattedDateDifference(expireDate: string, createdDate: string): string {
    const diff = this.getMonthDifference(expireDate, createdDate);
    if(diff.months == 0) {
      return `${diff.days} ` +  this.i18n.fanyi('app.day')
    } else if (diff.days == 0) {
      return `${diff.months} ` +  this.i18n.fanyi('app.months')
    } else {
      return `${diff.months} ` + this.i18n.fanyi('app.months') +  ` ${diff.days} ` +  this.i18n.fanyi('app.day');
    }
  }
}
