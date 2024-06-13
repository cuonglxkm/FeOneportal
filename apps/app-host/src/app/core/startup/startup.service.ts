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
import { Observable, zip, catchError, map, of } from 'rxjs';
import { environment } from '@env/environment';

import { ICONS } from '../../../style-icons';
import { ICONS_AUTO } from '../../../style-icons-auto';
import { I18NService } from '../i18n/i18n.service';
import { CoreDataService } from '../../../../../../libs/common-utils/src';
import { PolicyService } from 'src/app/shared/services/policy.service';

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
    private regionProjectService: CoreDataService
  ) {
    iconSrv.addIcon(...ICONS_AUTO, ...ICONS);
  }

  load(): Observable<void> {
    const defaultLang = this.i18n.defaultLang;
    console.log(defaultLang);
    
    const baseUrl = environment['baseUrl'];
    console.log(baseUrl);
    return zip(
      this.i18n.loadLangData(defaultLang),
      
      defaultLang !== 'vi-VI' ? this.httpClient.get('assets/tmp/app-data-en.json') : this.httpClient.get('assets/tmp/app-data.json'),
      // localStorage.getItem('_token')
      //   ? this.httpClient.get(baseUrl + '/provisions/object-storage/userinfo')
      //   : of(null)
    ).pipe(
      catchError((res) => {
        console.warn(`StartupService.load: Network request failed`, res);
        setTimeout(() => this.router.navigateByUrl(`/exception/500`));
        return [];
      }),
      map(
        ([langData, appData]: [
          Record<string, string>,
          NzSafeAny,
        ]) => {
          // setting language data
          this.i18n.use(defaultLang, langData);
          console.log(appData);
          
          this.settingService.setApp({
            name: 'One Portal',
            description: 'One Portal',
          });
          // Set user info
          // this.settingService.setUser(appData.user);

          this.aclService.setFull(true);

          this.menuService.add(appData.menu);
          
          
          this.regionProjectService.getCoreData(baseUrl);
          if (localStorage?.getItem('PermissionOPA')){
            this.checkPermissionAction(this.menuService['data']);
          } else {
            this.policyService.getUserPermissions().pipe().subscribe( (permission) => {
              localStorage.setItem('PermissionOPA', JSON.stringify(permission));
              this.checkPermissionAction(this.menuService['data']);
            });
          }
          
          // if (checkData) {
          //   let json = {
          //     key: 'Object Storage',
          //     text: 'Object Storage',
          //     icon: 'anticon-profile',
          //     children: [
          //       {
          //         text: 'Bucket',
          //         link: '/app-smart-cloud/object-storage/bucket',
          //       },
          //       {
          //         text: 'Sub User',
          //         link: '/app-smart-cloud/object-storage/sub-user/list',
          //       },
          //       {
          //         text: 'S3 Key',
          //         link: '/app-smart-cloud/object-storage/s3-key',
          //       },
          //       {
          //         text: 'Thống kê',
          //         link: '/app-smart-cloud/object-storage/dashboard',
          //       },
          //     ],
          //   };
          //   this.menuService.setItem('Object Storage', json);
          // } else {
          //   let json = {
          //     key: 'Object Storage',
          //     text: 'Object Storage',
          //     icon: 'anticon-profile',
          //     link: '/app-smart-cloud/object-storage',
          //   };
          //   this.menuService.setItem('Object Storage', json);
          // }
          // this.menuService.resume();

          this.titleService.default = '';
          this.titleService.suffix = appData.app.name;
        }
      )
    );
  }

  async checkPermissionAction(datas: any[]){
    datas.forEach(async (item) =>{
      if(item.action){
        item._hidden = !(await this.policyService.hasPermission(item.action));
      }
      if(item.children && item.children.length > 0){
        await this.checkPermissionAction(item.children);
      }
    });
  }
}

function updateMenuItem(menuItems: any[], searchText: string): void {
  // Duyệt qua từng mục trong mảng menuItems
  menuItems.forEach((item) => {
    // Nếu mục hiện tại có thuộc tính text bằng searchText
    if (item.text === searchText) {
      // Thay đổi giá trị của thuộc tính text thành newText
      item.children = [];
      item.link = '/app-smart-cloud/object-storage';
      return; // Kết thúc vòng lặp
    }
    // Nếu mục hiện tại có thuộc tính children và là một mảng
    if (item.children && Array.isArray(item.children)) {
      // Gọi đệ quy để tìm và sửa menuItem trong mảng con
      updateMenuItem(item.children, searchText);
    }
  });
}
