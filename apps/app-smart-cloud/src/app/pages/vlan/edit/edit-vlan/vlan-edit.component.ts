import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { AppValidator } from '../../../../../../../../libs/common-utils/src';
import { VlanService } from '../../../../shared/services/vlan.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'one-portal-vlan-extend',
  templateUrl: './vlan-edit.component.html',
  styleUrls: ['./vlan-edit.component.less'],
})
export class VlanEditComponent {
  @Input() region: number
  @Input() project: number
  @Input() id: number
  @Input() nameNetwork: string
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisibleEditVlan: boolean = false
  isLoadingEditVlan: boolean = false

  validateForm: FormGroup<{
    nameNetwork: FormControl<string>
  }> = this.fb.group({
    nameNetwork: ['', [Validators.required,
      AppValidator.startsWithValidator('vlan_'),
      Validators.maxLength(50),
      Validators.pattern(/^[a-zA-Z0-9_]*$/)]]
  });

  constructor(private vlanService: VlanService,
              private notification: NzNotificationService,
              private fb: NonNullableFormBuilder) {
  }

  showModalEditVlan() {
    this.isVisibleEditVlan = true
  }

  handleCancelEditVlan() {
    this.isVisibleEditVlan = false
    this.isLoadingEditVlan = false
    this.onCancel.emit()
  }

  handleOkEditVlan() {
    if(this.validateForm.valid){
      this.isLoadingEditVlan = true
      this.vlanService.updateNetwork(this.id, this.validateForm.controls.nameNetwork.value).subscribe(data => {
        if(data) {
          this.isLoadingEditVlan = false
          this.isVisibleEditVlan = false
          this.notification.success('Thành công', 'Chỉnh sửa Network thành công')
          this.validateForm.reset()
          this.onOk.emit(data)
        }
      }, error => {
        this.isLoadingEditVlan = false
        this.isVisibleEditVlan = false
        this.notification.error('Thất bại', 'Chỉnh sửa Network thất bại')
        this.validateForm.reset()
      })
    }
  }
}
