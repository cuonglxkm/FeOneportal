import { Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VolumeService } from '../../../../../shared/services/volume.service';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'one-portal-delete-volume',
  templateUrl: './delete-volume.component.html',
  styleUrls: ['./delete-volume.component.less'],
})
export class DeleteVolumeComponent {
  @Input() region: number
  @Input() project: number
  @Input() volumeId: number
  @Input() volumeName: string
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isLoading: boolean = false
  isVisible: boolean = false

  value: string
  isInput: boolean = false

  @ViewChild('okButton') okButton: ElementRef;


  constructor(private notification: NzNotificationService,
              private volumeService: VolumeService) {
  }

  focusOkButton(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleOk()
    }
  }

  showModal() {
    this.isVisible = true
  }

  handleCancel() {
    this.isVisible = false
    this.isLoading = false
    this.isInput = false
    this.value = null
    this.onCancel.emit()
  }

  onInputChange(value) {
    this.value = value;
  }

  handleOk() {
    this.isLoading = true
    if (this.value == this.volumeName) {
      this.isInput = false
      this.volumeService.deleteVolume(this.volumeId).subscribe(data => {
        if (data) {
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
    } else {
      this.isInput = true
      this.isLoading = false
    }
  }

  // ngAfterViewInit(): void {
  //   // Khi modal được mở, thiết lập focus vào nút OK
  //   this.modal.afterOpen.subscribe(() => {
  //     if (this.okButton) {
  //       this.okButton.nativeElement.focus();
  //     }
  //   });
  // }

}


