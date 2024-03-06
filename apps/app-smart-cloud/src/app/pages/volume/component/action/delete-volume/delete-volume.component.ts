import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VolumeService } from '../../../../../shared/services/volume.service';

@Component({
  selector: 'one-portal-delete-volume',
  templateUrl: './delete-volume.component.html',
  styleUrls: ['./delete-volume.component.less'],
})
export class DeleteVolumeComponent {
  @Input() region: number
  @Input() project: number
  @Input() volumeId: number
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isLoading: boolean = false
  isVisible: boolean = false

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private volumeService: VolumeService) {
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
    this.volumeService.deleteVolume(this.volumeId).subscribe(data => {
      if(data) {
        this.isLoading = false
        this.isVisible = false
        this.notification.success('Thành công', 'Xóa Volume thành công')
        this.onOk.emit(data)
      } else {
        console.log('data', data)
        this.isLoading = false
        this.isVisible = false
        this.notification.error('Thất bại', 'Xóa Volume thất bại')
      }
    }, error => {
      console.log('error', error)
      this.isLoading = false
      this.isVisible = false
      this.notification.error('Thất bại', 'Xóa Volume thất bại')
    })
  }
}
