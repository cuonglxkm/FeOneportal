import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { WanService } from '../../../../shared/services/wan.service';

@Component({
  selector: 'one-portal-delete-wan',
  templateUrl: './delete-wan.component.html',
  styleUrls: ['./delete-wan.component.less'],
})
export class DeleteWanComponent {
  @Input() region: number
  @Input() project: number
  @Input() idWan: number
  @Input() addressWan: string
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  validateForm: FormGroup<{
    ip: FormControl<string>
  }> = this.fb.group({
    ip: ['', [Validators.required]]
  });

  isLoading: boolean = false
  isVisible: boolean = false

  constructor(private fb: NonNullableFormBuilder,
              private notification: NzNotificationService,
              private ipWanService: WanService) {
  }
  showModalDelete() {
    this.isVisible = true
  }

  handleCancelDelete() {
    this.isVisible = false
    this.isLoading = false
    this.onCancel.emit()
  }

  handleOkDelete() {
    this.isLoading = true
    if(this.addressWan.includes(this.validateForm.controls.ip.value)){
      this.ipWanService.delete(this.idWan).subscribe(data => {
        if(data){
          this.isVisible = false
          this.isLoading = false
          this.notification.success('Thành công', 'Xóa IP WAN thành công')
          this.onOk.emit(data)
        } else {
          this.isVisible = false
          this.isLoading = false
          this.notification.error('Thất bại', 'Xóa IP WAN thất bại')
        }
      }, error => {
        this.isVisible = false
        this.isLoading = false
        this.notification.error('Thất bại', 'Xóa IP WAN thất bại')
      })
    }
  }
}
