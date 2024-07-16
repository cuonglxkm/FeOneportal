import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ACLService } from '@delon/acl';
import {
  ALAIN_I18N_TOKEN,
  MenuService,
  SettingsService,
  TitleService,
} from '@delon/theme';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzIconService } from 'ng-zorro-antd/icon';
import { Observable, zip, catchError, map, throwError, from } from 'rxjs';
import { environment } from '@env/environment';

import { ICONS } from '../../../style-icons';
import { ICONS_AUTO } from '../../../style-icons-auto';
import { I18NService } from '../i18n/i18n.service';
import { CoreDataService } from '../../../../../../libs/common-utils/src';
import { PolicyService } from 'src/app/shared/services/policy.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

/**
 * Used for application startup
 * Generally used to get the basic data of the application, like: Menu Data, User Data, etc.
 */
@Injectable()
export class StartupService {
  constructor(
    iconSrv: NzIconService,
    private menuService: MenuService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private settingService: SettingsService,
    private aclService: ACLService,
    private titleService: TitleService,
    private httpClient: HttpClient,
    private router: Router,
    private policyService: PolicyService,
    private regionProjectService: CoreDataService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService
  ) {
    iconSrv.addIcon(...ICONS_AUTO, ...ICONS);
  }

  menuData: any;

  private token =
    'Bearer 6cb31a40836230e87730e36a150860fd22482b0458dedb8e5e42fb332048b475335bbe1debd1b3d1bea5604ff8d2049ebb78765c0fd62fd7058285bb1051d2cf333f3e10a0f722c7dfe4125246f9761312afd6b8b6370c5ea346f24c4dcb6047472b568e21dc9ce75ed458150cd91a72e72adc088d69fe96430fb8cf981cc51d';
  private apiUrl =
    'https://cms.onsmartcloud.com/api/menu-lists?populate=*, icon_level1, menu_level2.icon_level2, menu_level2.menu_level3.icon_level3&sort=priorityID:asc';

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: this.token,
    };
  }

  async loadMenu(): Promise<any> {
    const headers = this.getHeaders();

    try {
      const response = await fetch(this.apiUrl, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      return this.transformResponse(res.data);
    } catch (error) {
      console.error('Failed to load menu data:', error);
      throw error;
    }
  }

  private transformResponse(data: any): any {
    return {
      app: { name: 'One portal', description: 'One portal' },
      user: {
        name: 'Admin',
        avatar: './assets/tmp/img/avatar.jpg',
        email: 'cipchk@qq.com',
      },
      menu: [
        {
          text: '',
          group: true,
          hideInBreadcrumb: true,
          children: data.map((item: any) => ({
            text: item.attributes.name,
            icon: {
              type: 'svg',
              value: item.attributes.icon_level1.replaceAll('\\', ''),
            },
            link: item.attributes.link_level1,
            group: item.attributes.menu_level2.length > 0,
            action: item.attributes.action_level1,
            isShow: item.attributes.isShow,
            children:
              item.attributes.menu_level2.length > 0
                ? item.attributes.menu_level2.map((subItem: any) => ({
                    text: subItem.name_level2,
                    icon:
                      subItem.icon_level2 !== null &&
                      subItem.icon_level2.includes('anticon')
                        ? subItem.icon_level2
                        : {
                            value:
                              subItem.icon_level2 === null
                                ? subItem.icon_level2
                                : subItem.icon_level2.replaceAll('\\', ''),
                            type: subItem.icon_level2 === null ? '' : 'svg',
                          },
                    link: subItem.link_level2,
                    group:
                      subItem.menu_level3.length &&
                      subItem.menu_level3.length > 0
                        ? true
                        : false,
                    action: subItem.action_level2,
                    isShow: subItem.isShow,
                    children:
                      subItem.menu_level3.length &&
                      subItem.menu_level3.length > 0
                        ? subItem.menu_level3.map((subSubItem: any) => ({
                            text: subSubItem.name_level3,
                            icon:
                              subSubItem.icon_level3 !== null &&
                              subSubItem.icon_level3.includes('anticon')
                                ? subSubItem.icon_level3
                                : {
                                    value:
                                      subSubItem.icon_level3 === null
                                        ? subSubItem.icon_level3
                                        : subSubItem.icon_level3.replaceAll(
                                            '\\',
                                            ''
                                          ),
                                    type:
                                      subSubItem.icon_level3 === null
                                        ? ''
                                        : 'svg',
                                  },
                            link: subSubItem.link_level3,
                            isShow: subSubItem.isShow,
                            action: subSubItem.action_level3,
                          }))
                        : [],
                  }))
                : [],
          })),
        },
      ],
    };
  }

  load(): Observable<void> {
    const defaultLang = this.i18n.defaultLang;
    const baseUrl = environment['baseUrl'];

    return zip(
      this.i18n.loadLangData(defaultLang),
      defaultLang !== 'vi-VI'
        ? this.httpClient.get('assets/tmp/app-data-en.json')
        : this.httpClient.get('assets/tmp/app-data.json')
    ).pipe(
      catchError((res) => {
        console.log(`StartupService.load: Network request failed`, res);
        setTimeout(() => this.router.navigateByUrl(`/exception/500`));
        return [];
      }),
      map(([langData, appData]: [Record<string, string>, NzSafeAny]) => {
        // setting language data
        this.i18n.use(defaultLang, langData);
        const menuDataPromise = this.loadMenu();
        const menuDataObservable = from(menuDataPromise);
        menuDataObservable
          .pipe(
            catchError((error) => {
              console.error('Error loading menu data:', error);
              this.menuService.add(appData.menu);
              return throwError(error);
            })
          )
          .subscribe(
            (data) => {
              this.menuData = data;        
              this.menuService.add(this.menuData.menu);
              this.regionProjectService.getCoreData(baseUrl);
              this.checkisShowMenu(this.menuData.menu);
              if (localStorage?.getItem('PermissionOPA')) {
                this.checkPermissionAction(this.menuData.menu);
              } else if (localStorage?.getItem('UserRootId')) {
                this.policyService
                  .getUserPermissions()
                  .pipe()
                  .subscribe((permission) => {
                    localStorage.setItem(
                      'PermissionOPA',
                      JSON.stringify(permission)
                    );
                    this.checkPermissionAction(this.menuData.menu);
                  });
              }
              
              console.log(this.menuData.menu);
              
            },
            (error) => {
              console.error('Error loading menu data:', error);
            }
          );
        this.settingService.setApp({
          name: 'One Portal',
          description: 'One Portal',
        });
        // Set user info
        // this.settingService.setUser(appData.user);

        this.aclService.setFull(true);

        this.titleService.default = '';
        this.titleService.suffix = appData.app.name;
      })
    );
  }

  async checkPermissionAction(datas: any[]) {
    for (const item of datas) {
        if (item.action) {
            if (!item._hidden) {
                item._hidden = !(await this.policyService.hasPermission(item.action));
            }
        }
        if (item.children && item.children.length > 0) {
            await this.checkPermissionAction(item.children);
        }
    }
}

  checkisShowMenu(items: any[]) {
    items.forEach(item => {
      if (item.isShow !== null) {
        item._hidden = item.isShow === false;
      }else{
        item._hidden = false;
      }
      if (item.children) {
        this.checkisShowMenu(item.children);
      }
    });
  }
}
