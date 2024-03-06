import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { AppValidator } from '../../../../../../../../libs/common-utils/src';
import { VlanService } from '../../../../shared/services/vlan.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'one-portal-delete-vlan',
  templateUrl: './delete-vlan.component.html',
  styleUrls: ['./delete-vlan.component.less'],
})
export class DeleteVlanComponent {
  @Input() region: number
  @Input() project: number
  @Input() id: number
  @Input() nameNetwork: string
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisibleDelete: boolean = false
  isLoadingDelete: boolean = false

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
              private fb: NonNullableFormBuilder){
  }

  showModalDelete() {
    this.isVisibleDelete = true
  }

  handleCancelDelete() {
    this.isVisibleDelete = false
    this.isLoadingDelete = false
    this.onCancel.emit()
  }

  handleOkDelete() {
    if(this.validateForm.controls.nameNetwork.value.includes(this.nameNetwork)) {
      this.isLoadingDelete = true
      this.vlanService.deleteNetwork(this.id).subscribe(data => {
        if(data) {
          this.isLoadingDelete = false
          this.isVisibleDelete = false
          this.notification.success('Thành công', 'Xoá Network thành công')
          this.validateForm.reset()
          this.onOk.emit(data)
        }
      }, error => {
        this.isLoadingDelete = false
        this.isVisibleDelete = false
        this.notification.error('Thất bại', 'Xoá Network thất bại')
        this.validateForm.reset()
      })
    }
  }
}
