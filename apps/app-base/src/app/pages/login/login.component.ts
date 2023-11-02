import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { en_US, NzI18nService, vi_VN } from 'ng-zorro-antd/i18n';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  constructor(private i18n: NzI18nService, private translate: TranslateService) { }

  ngOnInit(): void { }

  curLangCode() {
    return this.i18n.getLocale();
  }

  changeLanguage(language: string) {
    this.i18n.setLocale(language === 'vi_VN' ? vi_VN : en_US);
    this.translate.use(language === 'vi_VN' ? 'vi' : 'en')
  }
}
