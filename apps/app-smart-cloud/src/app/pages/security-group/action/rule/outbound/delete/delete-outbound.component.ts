import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { SecurityGroupRuleService } from '../../../../../../shared/services/security-group-rule.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { FormDeleteRule } from '../../../../../../shared/models/security-group-rule';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-delete-outbound',
  templateUrl: './delete-outbound.component.html',
  styleUrls: ['./delete-outbound.component.less'],
})
export class DeleteOutboundComponent {
  @Input() idOutbound: string
  @Input() nameRule: string
  @Input() region: number
  @Input() project: number
  @Output() onCancel = new EventEmitter<void>();
  @Output() onOk = new EventEmitter<void>();

  isVisible: boolean = false
  isLoading: boolean = false

  constructor(private securityGroupRuleService: SecurityGroupRuleService,
              private notification: NzNotificationService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
  }
  showModal() {
    this.isVisible = true
  }

  handleCancel() {
    this.isVisible = false
    this.isLoading = false
    this.onCancel.emit()
  }

  handleOk() {
    this.isLoading = true
    let formDeleteRule = new FormDeleteRule()
    formDeleteRule.id = this.idOutbound
    formDeleteRule.userId = this.tokenService.get()?.userId
    formDeleteRule.regionId = this.region
    formDeleteRule.projectId = this.project
    this.securityGroupRuleService.deleteRule(formDeleteRule).subscribe(data => {
      this.isLoading = false
      this.isVisible = false
      this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.cluster.delete-outbound') + ' ' + this.nameRule +' '+this.i18n.fanyi('app.status.success'));
      this.onOk.emit();
    }, error => {
      this.isLoading = false
      this.isVisible = false
      this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.cluster.delete-outbound') + ' ' + this.nameRule +' '+this.i18n.fanyi('app.status.fail'));
    })
  }
}
