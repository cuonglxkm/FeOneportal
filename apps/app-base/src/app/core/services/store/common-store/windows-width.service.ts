import { Injectable } from '@angular/core';
import { EquipmentWidth } from '@app/core/models/enum';
import { BehaviorSubject, Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class WindowsWidthService {
  private windowWidth$ = new BehaviorSubject<EquipmentWidth>(EquipmentWidth.xxl);

  constructor() {}
  setWindowWidthStore(store: EquipmentWidth): void {
    this.windowWidth$.next(store);
  }

  getWindowWidthStore(): Observable<EquipmentWidth> {
    return this.windowWidth$.asObservable();
  }
}
