import { Injectable } from '@angular/core';
import { ModalWrapService } from '@widget/base-modal';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { ModalOptions } from 'ng-zorro-antd/modal';
import { Observable } from 'rxjs';
import { UserModalComponent } from './user-modal.component';

@Injectable({
  providedIn: 'root'
})
export class UserModalService {
  constructor(private modalWrapService: ModalWrapService) { }
  protected getContentComponent(): NzSafeAny {
    return UserModalComponent;
  }

  public show(modalOptions: ModalOptions = {}, params?: object): Observable<NzSafeAny> {
    return this.modalWrapService.show(this.getContentComponent(), modalOptions, params);
  }
}
