import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { ActionCode } from '@config/actionCode';
import { TokenKey, TokenPre } from '@config/constant';
import { SimpleReuseStrategy } from '@app/core/services/common/strategy/reuse-strategy';
import { TabService } from '@core/services/common/tab.service';
import { WindowService } from '@core/services/common/window.service';
import { Menu } from '@app/core/models/interfaces/types';
import { LoginService } from '@services/login/login.service';
import { MenuStoreService } from '@store/common-store/menu-store.service';
import { UserInfoService } from '@store/common-store/userInfo.service';
import { UserInfoNew } from '@app/core/models/interfaces/user';
import { getDeepReuseStrategyKeyFn } from '@utils/tools';
import { fnFlatDataHasParentToTree } from '@utils/treeTableTools';

/*
 * Logout
 * */
@Injectable({
  providedIn: 'root'
})
export class LoginInOutService {
  constructor(
    private activatedRoute: ActivatedRoute,
    private tabService: TabService,
    private loginService: LoginService,
    private router: Router,
    private userInfoService: UserInfoService,
    private menuService: MenuStoreService,
    private windowServe: WindowService
  ) { }

  // Get the menu array by user Id
  getMenuByUserId(userId: string): Observable<Menu[]> {
    return this.loginService.getMenuByUserId(userId);
  }

  loginIn(token: string): Promise<void> {
    return new Promise(resolve => {
      // Cache the token persistently, please note that if there is no cache, it will be intercepted in the route guard, preventing the route from jumping
      // This route guard is in src/app/core/services/common/guard/judgeLogin.guard.ts
      this.windowServe.setSessionStorage(TokenKey, TokenPre + token);
      // Parse the token and get user information
      const userInfo: UserInfoNew = this.userInfoService.parsToken(TokenPre + token);
      // Todo Here is the permission to manually add the button to open the details in the static page tab operation, because they involve routing jumps, and they will be guarded by walking, but the permissions are not managed by the backend, so the following two lines manually add permissions, In actual operation, the following 2 lines can be deleted
      userInfo.authCode.push(ActionCode.TabsDetail);
      userInfo.authCode.push(ActionCode.SearchTableDetail);
      userInfo.authCode.push(ActionCode.MenuAddLowLevel);
      userInfo.authCode.push(ActionCode.MenuEdit);
      userInfo.authCode.push(ActionCode.MenuDel);
      userInfo.authCode.push(ActionCode.RoleManagerAdd)
      userInfo.authCode.push(ActionCode.RoleManagerEdit)
      userInfo.authCode.push(ActionCode.RoleManagerDel)
      userInfo.authCode.push(ActionCode.RoleManagerSetRole)
      // Cache user information to the global service
      this.userInfoService.setUserInfo(userInfo);
      // Get the menu owned by this user through the user id
      this.getMenuByUserId(userInfo.userId)
        .pipe(
          finalize(() => {
            resolve();
          })
        )
        .subscribe(menus => {
          menus = menus.filter(item => {
            item.selected = false;
            item.open = false;
            return item.menuType === 'C';
          });
          const temp = fnFlatDataHasParentToTree(menus);
          // store the menu
          this.menuService.setMenuArrayStore(temp);
          resolve();
        });
    });
  }

  // Clearing the Tab cache is something related to routing reuse
  async clearTabCash(): Promise<void> {
    await SimpleReuseStrategy.deleteAllRouteSnapshot(this.activatedRoute.snapshot);
    return await new Promise(resolve => {
      // Clear the tab
      this.tabService.clearTabs();
      resolve();
    });
  }

  clearSessionCash(): Promise<void> {
    return new Promise(resolve => {
      this.windowServe.removeSessionStorage(TokenKey);
      this.menuService.setMenuArrayStore([]);
      resolve();
    });
  }

  async loginOut(): Promise<void> {
    await this.clearTabCash();
    await this.clearSessionCash();
    this.router.navigate(['/login/login-form']);
  }
}
