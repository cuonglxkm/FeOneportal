import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VlanService } from '../../../shared/services/vlan.service';
import { InstancesService } from '../../instances/instances.service';
import { debounceTime } from 'rxjs';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-detach-port',
  templateUrl: './detach-port.component.html',
  styleUrls: ['./detach-port.component.less'],
})
export class DetachPortComponent {
  @Input() region: number
  @Input() project: number
  @Input() id: string
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isLoadingDetach: boolean = false
  isVisibleDetach: boolean = false

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private vlanService: VlanService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private instancesService: InstancesService) {
  }

  showModalDetachPort() {
    this.isVisibleDetach = true
  }

  handleCancelDetachPort() {
    this.isVisibleDetach = false
    this.isLoadingDetach = false
    this.onCancel.emit()
  }

  handleOkDetachPort() {
    this.isLoadingDetach = true
    this.vlanService.detachPort(this.id, this.region, this.project)
      .pipe(debounceTime(1500))
      .subscribe(data => {
      console.log('detach', data)
      this.isVisibleDetach = false
      this.isLoadingDetach = false
      this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.vlan.note49'))
      setTimeout(() => {this.onOk.emit(data)}, 2500)
    }, error => {
      this.isVisibleDetach = false
      this.isLoadingDetach = false
      this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.vlan.note50') + error.error.detail)
    })
  }
}
