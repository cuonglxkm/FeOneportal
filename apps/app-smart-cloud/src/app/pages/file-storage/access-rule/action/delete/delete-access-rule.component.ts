import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AccessRuleService } from '../../../../../shared/services/access-rule.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-delete-access-rule',
  templateUrl: './delete-access-rule.component.html',
  styleUrls: ['./delete-access-rule.component.less']
})
export class DeleteAccessRuleComponent {
  @Input() region: number;
  @Input() project: number;
  @Input() shareRuleId: string;
  @Input() shareCloudId: string;
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();

  isVisible: boolean = false;
  isLoading: boolean = false;


  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private accessRuleService: AccessRuleService,
              private fb: NonNullableFormBuilder,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
  }

  showModal() {
    this.isVisible = true;
    this.isLoading = false;
  }

  handleCancel() {
    this.isVisible = false;
    this.isLoading = false;
    this.onCancel.emit();
  }

  handleOk() {
    this.isLoading = true;
    this.accessRuleService.deleteAccessRule(this.shareRuleId, this.region, this.project, this.shareCloudId).subscribe(data => {

      this.isVisible = false;
      this.isLoading = false;
      this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.file.system.access.to.delete.success'));
      this.onOk.emit(data);
    }, error => {
      this.isVisible = false;
      this.isLoading = false;
      this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.file.system.access.to.delete.fail') + error.error.detail);
    });
  }
}
