import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { InstancesService } from '../../../instances/instances.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { InstancesModel } from '../../../instances/instances.model';
import { FormAction } from '../../../../shared/models/wan.model';
import { WanService } from '../../../../shared/services/wan.service';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';

@Component({
  selector: 'one-portal-attach-wan',
  templateUrl: './attach-wan.component.html',
  styleUrls: ['./attach-wan.component.less'],
})
export class AttachWanComponent {
  @Input() region: number
  @Input() project: number
  @Input() idWan: number
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isLoading: boolean = false
  isVisible: boolean = false

  listVm: InstancesModel[]
  instanceSelected: any

  constructor(private fb: NonNullableFormBuilder,
              private instancesService: InstancesService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private wanService: WanService) {
  }

  onChange(value) {
    this.instanceSelected = value
  }

  showModalAttachWan() {
    this.isVisible = true
    this.isLoading = false
    this.getListVm()
  }

  handleCancelAttach() {
    this.isVisible = false
    this.isLoading = false
    this.onOk.emit()
  }

  getListVm() {
    this.instancesService.search(1, 9999, this.region, this.project, '', '',
      true, this.tokenService.get()?.userId).subscribe(data => {
      this.listVm = data.records
      console.log('listvm', this.listVm)
    })
  }

  submitForm() {
    this.isLoading = true
    let formAction = new FormAction()
    formAction.id = this.idWan
    formAction.instanceId = this.instanceSelected
    formAction.action = 'attach'

    this.wanService.action(formAction).subscribe(data => {
      this.isVisible = false
      this.isLoading = false
      this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.wan.note16'))
      this.onOk.emit(data)
    }, error =>  {
      this.isVisible = false
      this.isLoading = false
      this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.wan.note17'))
    })
  }
}
