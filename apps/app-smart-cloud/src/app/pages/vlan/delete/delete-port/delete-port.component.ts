import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VlanService } from '../../../../shared/services/vlan.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-delete-port',
  templateUrl: './delete-port.component.html',
  styleUrls: ['./delete-port.component.less'],
})
export class DeletePortComponent {
  @Input() region: number
  @Input() project: number
  @Input() id: string
  @Input() attach: any
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisibleDeletePort: boolean = false
  isLoadingDeletePort: boolean = false

  noti: boolean = false;

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private vlanService: VlanService) {
  }

  showModalDeletePort() {
    this.isVisibleDeletePort = true
    this.isLoadingDeletePort = false
  }

  handleCancelDeletePort() {
    this.isVisibleDeletePort = false
    this.isLoadingDeletePort = false
    this.onCancel.emit()
  }

  handleOkDeletePort() {
    this.isLoadingDeletePort = true
    if(this.attach == undefined || this.attach == null || this.attach == '') {
      this.noti = false
      this.vlanService.deletePort(this.id, this.region, this.project).subscribe(data => {
        console.log('delete', data)
        this.isVisibleDeletePort = false
        this.isLoadingDeletePort = false
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.vlan.note51'))
        setTimeout(() => {this.onOk.emit(data)}, 1500)
      }, error => {
        this.isVisibleDeletePort = false
        this.isLoadingDeletePort = false
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.vlan.note52'), error.error.detail)
      })
    } else {
      this.noti = true
      this.isLoadingDeletePort = false
    }

  }
}
