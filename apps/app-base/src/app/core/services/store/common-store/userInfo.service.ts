import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { JwtHelperService } from '@auth0/angular-jwt';
import { UserInfo, UserInfoNew } from '@app/core/models/interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {
  private userInfo$ = new BehaviorSubject<UserInfoNew>({ userId: '', authCode: [] });

  constructor() { }

  parsToken(token: string): UserInfoNew {
    const helper = new JwtHelperService();
    try {
      const { firebase, user_id, ...data } = helper.decodeToken(token)
      return { userId: user_id, authCode: [], sign_in_provider: firebase.sign_in_provider, ...data }
    } catch (e) {
      return { userId: '', authCode: [] }
      // return { userId: -1, authCode: [] };
    }
  }

  setUserInfo(userInfo: UserInfoNew): void {
    this.userInfo$.next(userInfo);
  }

  getUserInfo(): Observable<UserInfoNew> {
    return this.userInfo$.asObservable();
  }
}
