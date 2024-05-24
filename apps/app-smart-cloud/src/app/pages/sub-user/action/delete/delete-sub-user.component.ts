import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { SubUserService } from '../../../../shared/services/sub-user.service';
import { FormDeleteSubUser } from '../../../../shared/models/sub-user.model';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-delete-sub-user',
  templateUrl: './delete-sub-user.component.html',
  styleUrls: ['./delete-sub-user.component.less']
})
export class DeleteSubUserComponent implements AfterViewInit {
  @Input() region: number;
  @Input() project: number;
  @Input() uid: string;
  @Input() idSubUser: string;
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();

  isLoading: boolean = false;
  isVisible: boolean = false;

  value: string;
  isInput: boolean = false;

  @ViewChild('subuserInputName') subuserInputName!: ElementRef<HTMLInputElement>;

  constructor(@Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private fb: NonNullableFormBuilder,
              private subUserService: SubUserService) {
  }

  focusOkButton(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleOk();
    }
  }

  showModal() {
    this.isVisible = true;
    setTimeout(() => {
      this.subuserInputName?.nativeElement.focus();
    }, 1000);
  }

  onInput(value) {
    this.value = value;
  }

  handleCancel() {
    this.isVisible = false;
    this.isLoading = false;
    this.onCancel.emit();
  }

  handleOk() {
    this.isLoading = true;
    if (this.value == this.idSubUser) {
      this.isInput = false;
      let formDelete = new FormDeleteSubUser();
      formDelete.uid = this.uid;
      formDelete.subuser = this.idSubUser;
      formDelete.purge_data = true;
      formDelete.actorEmail = '';
      this.subUserService.deleteSubUser(formDelete).subscribe(data => {
        this.isLoading = false;
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.delete.subuser.success'));
        this.onOk.emit();
      }, error => {
        this.isLoading = false;
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.delete.subuser.fail'));
      });
    } else {
      this.isInput = true;
      this.isLoading = false;
    }
  }

  ngAfterViewInit() {

  }
}
