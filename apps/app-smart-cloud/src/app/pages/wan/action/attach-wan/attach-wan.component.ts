import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { InstancesService } from '../../../instances/instances.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { InstancesModel } from '../../../instances/instances.model';
import { FormAction } from '../../../../shared/models/wan.model';
import { WanService } from '../../../../shared/services/wan.service';

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
      this.notification.success('Thành công', 'Gán máy ảo thành công')
      this.onOk.emit(data)
    }, error =>  {
      this.isVisible = false
      this.isLoading = false
      this.notification.error('Thất bại', 'Gán máy ảo thất bại')
    })
  }
}
