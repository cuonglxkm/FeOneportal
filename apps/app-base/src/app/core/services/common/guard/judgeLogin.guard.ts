import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanActivateChild } from '@angular/router';

import { TokenKey } from '@config/constant';

import { WindowService } from '../window.service';

// Routing guard, if there is no TokenKey, then jump to the login page
@Injectable({
  providedIn: 'root'
})
export class JudgeLoginGuard implements CanActivateChild {
  constructor(private windowSrc: WindowService, private router: Router) {}

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const isLogin = !!this.windowSrc.getSessionStorage(TokenKey);
    if (isLogin) {
      return true;
    }
    return this.router.parseUrl('/login');
  }
}
