import { Component } from '@angular/core';
import { NzI18nService, en_US, vi_VN } from 'ng-zorro-antd/i18n';

@Component({
  selector: 'one-portal-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent {
  title = 'app-host';
  isCollapsed = false;

  constructor(private i18n: NzI18nService) {
    this.i18n.setLocale(vi_VN);
  }
}
