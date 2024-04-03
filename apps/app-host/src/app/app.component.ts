import { Component, Inject } from '@angular/core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NzI18nService, en_US, vi_VN } from 'ng-zorro-antd/i18n';
import { I18NService } from './core/i18n/i18n.service';

@Component({
  selector: 'one-portal-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent {
  title = 'app-host';
  isCollapsed = false;


  constructor(private i18nz: NzI18nService, @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
    const defaultLang = this.i18n.defaultLang;
    console.log(defaultLang);
    
    if(defaultLang === 'en-US'){
      this.i18nz.setLocale(en_US);
    }else{
      this.i18nz.setLocale(vi_VN);
    }
  }
}
