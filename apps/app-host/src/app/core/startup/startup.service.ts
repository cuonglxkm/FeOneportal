import {HttpClient} from '@angular/common/http';
import {APP_INITIALIZER, inject, Inject, Injectable, Provider} from '@angular/core';
import {Router} from '@angular/router';
import {ACLService} from '@delon/acl';
import {ALAIN_I18N_TOKEN, MenuService, SettingsService, TitleService} from '@delon/theme';
import {NzSafeAny} from 'ng-zorro-antd/core/types';
import {NzIconService} from 'ng-zorro-antd/icon';
import {Observable, zip, catchError, map} from 'rxjs';

import {ICONS} from '../../../style-icons';
import {ICONS_AUTO} from '../../../style-icons-auto';
import {I18NService} from '../i18n/i18n.service';


export function provideStartup(): Provider[] {
  return [
    StartupService,
    {
      provide: APP_INITIALIZER,
      useFactory: (startupService: StartupService) => () => startupService.load(),
      deps: [StartupService],
      multi: true
    }
  ];
}

/**
 * Used for application startup
 * Generally used to get the basic data of the application, like: Menu Data, User Data, etc.
 */
@Injectable()
export class StartupService {

  private menuService = inject(MenuService);
  private settingService = inject(SettingsService);
  private aclService = inject(ACLService);
  private titleService = inject(TitleService);
  private httpClient = inject(HttpClient);
  private router = inject(Router);
  private i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  load(): Observable<void> {
    const defaultLang = this.i18n.defaultLang;
    return zip(this.i18n.loadLangData(defaultLang), this.httpClient.get('assets/tmp/app-data.json')).pipe(
      catchError(res => {
        console.warn(`StartupService.load: Network request failed`, res);
        setTimeout(() => this.router.navigateByUrl(`/exception/500`));
        return [];
      }),
      map(([langData, appData]: [Record<string, string>, NzSafeAny]) => {
        // setting language data
        this.i18n.use(defaultLang, langData);

        this.settingService.setApp({
          "name": "One Portal",
          "description": "One Portal"
        });
        // Set user info
        // this.settingService.setUser(appData.user);

        this.aclService.setFull(true);

        this.menuService.add(appData.menu);

        this.titleService.default = '';
        this.titleService.suffix = appData.app.name;
      })
    );
  }
}
