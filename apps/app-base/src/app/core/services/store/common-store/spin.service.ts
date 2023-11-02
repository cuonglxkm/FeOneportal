import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// spin service
@Injectable({
  providedIn: 'root'
})
export class SpinService {
  private globalSpin$ = new BehaviorSubject<boolean>(false);

  constructor() {}

  // Set the current loading object
  setCurrentGlobalSpinStore(isSpinning: boolean): void {
    this.globalSpin$.next(isSpinning);
  }

  getCurrentGlobalSpinStore(): Observable<boolean> {
    return this.globalSpin$.asObservable();
  }
}
