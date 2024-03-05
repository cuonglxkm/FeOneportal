import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { InstancesService } from '../../../instances/instances.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { InstancesModel } from '../../../instances/instances.model';

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
              private notification: NzNotificationService,) {
  }

  onChange(value) {
    this.instanceSelected = value
  }

  showModalAttachWan() {
    this.isVisible = true
    this.getListVm()
  }

  handleCancelAttach() {
    this.isVisible = false
    this.isLoading = false
    this.onOk.emit()
  }

  getListVm() {
    this.isLoading = true
    this.instancesService.search(1, 9999, this.region, this.project, '', '',
      true, this.tokenService.get()?.userId).subscribe(data => {
      this.isLoading = false
      this.listVm = data.records
      console.log('listvm', this.listVm)
    })
  }

  submitForm() {
  }
}
