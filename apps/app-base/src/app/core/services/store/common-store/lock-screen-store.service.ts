import { Injectable } from '@angular/core';
import { LockScreenFlag } from '@app/core/models/interfaces/lock-screen';
import { BehaviorSubject, Observable } from 'rxjs';

// The store of the lock screen status service
@Injectable({
  providedIn: 'root'
})
export class LockScreenStoreService {
  private lockScreenStore$ = new BehaviorSubject<LockScreenFlag>({ locked: false, password: '', beforeLockPath: '' });

  constructor() {}

  setLockScreenStore(store: LockScreenFlag): void {
    this.lockScreenStore$.next(store);
  }

  getLockScreenStore(): Observable<LockScreenFlag> {
    return this.lockScreenStore$.asObservable();
  }
}
