import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { SecurityGroupRuleService } from '../../../../../../shared/services/security-group-rule.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormDeleteRule } from '../../../../../../shared/models/security-group-rule';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-delete-inbound',
  templateUrl: './delete-inbound.component.html',
  styleUrls: ['./delete-inbound.component.less'],
})
export class DeleteInboundComponent {
  @Input() idInbound: string
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
    formDeleteRule.id = this.idInbound
    formDeleteRule.userId = this.tokenService.get()?.userId
    formDeleteRule.regionId = this.region
    formDeleteRule.projectId = this.project
    this.securityGroupRuleService.deleteRule(formDeleteRule).subscribe(data => {
      this.isLoading = false
      this.isVisible = false
      this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.cluster.delete-inbound') + ' ' + this.nameRule +' '+this.i18n.fanyi('app.status.success'));
      this.onOk.emit();
    }, error => {
      this.isLoading = false
      this.isVisible = false
      this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.cluster.delete-inbound') + ' ' + this.nameRule +' '+this.i18n.fanyi('app.status.success'));
    })
  }
}
