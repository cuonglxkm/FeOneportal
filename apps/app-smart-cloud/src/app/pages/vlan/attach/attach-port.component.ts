import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { InstancesModel } from '../../instances/instances.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VlanService } from '../../../shared/services/vlan.service';
import { ActivatedRoute } from '@angular/router';
import { InstancesService } from '../../instances/instances.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-attach-port',
  templateUrl: './attach-port.component.html',
  styleUrls: ['./attach-port.component.less'],
})
export class AttachPortComponent {
  @Input() region: number
  @Input() project: number
  @Input() id: string
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isLoadingAttach: boolean = false
  isVisibleAttach: boolean = false
  listVm: InstancesModel[]

  isLoading: boolean = false
  instanceSelected: string

  isSelected: boolean = false
  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private vlanService: VlanService,
              private instancesService: InstancesService) {
  }

  instanceChange(value) {
    this.instanceSelected = value

    this.isSelected = false
  }

  showModalAttach() {
    this.isVisibleAttach = true
    this.getListVm()
  }

  handleCancelAttach() {
    this.isVisibleAttach = false
    this.isLoadingAttach = false
    this.instanceSelected = null
    this.isSelected = false
    this.onCancel.emit()
  }

  handleOkAttach() {
    console.log('instance', this.instanceSelected)
    console.log('region', this.region)
    this.isLoadingAttach = true
    if(this.instanceSelected == undefined) {
      this.isSelected = true
      this.isLoadingAttach = false
    } else {
      this.isSelected = false
      this.isLoadingAttach = true

      this.vlanService.attachPort(this.id, this.instanceSelected, this.region, this.project).subscribe(data => {
        console.log('attach', data)
        this.isVisibleAttach = false
        this.isLoadingAttach = false
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.vlan.note63'))
        setTimeout(() => {
          this.onOk.emit(data)
        }, 1500);
      }, error => {
        this.isVisibleAttach = false
        this.isLoadingAttach = false
        this.instanceSelected = null
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.vlan.note64') + error.error.detail)
      })
    }

  }

  getListVm() {
    this.isLoading = true
    this.instancesService.search(1, 9999, this.region, this.project, '', '',
      true, this.tokenService.get()?.userId).subscribe(data => {
      this.isLoading = false
      this.listVm = data.records
      console.log('listvm', this.listVm)
      this.listVm = this.listVm.filter(item => item.taskState === 'ACTIVE' && item.status === 'KHOITAO')
    })
  }
}
