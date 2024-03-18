import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VolumeService } from '../../../../../shared/services/volume.service';
import { FileSystemService } from '../../../../../shared/services/file-system.service';
import { FormDeleteFileSystem } from '../../../../../shared/models/file-system.model';

@Component({
  selector: 'one-portal-delete-file-system',
  templateUrl: './delete-file-system.component.html',
  styleUrls: ['./delete-file-system.component.less'],
})
export class DeleteFileSystemComponent {
  @Input() region: number
  @Input() project: number
  @Input() fileSystemId: number
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isLoading: boolean = false
  isVisible: boolean = false

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private fileSystemService: FileSystemService) {
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
    let formDelete = new FormDeleteFileSystem()
    formDelete.id = this.fileSystemId
    formDelete.regionId = this.region

    this.fileSystemService.deleteFileSystem(formDelete).subscribe(data => {
      if(data) {
        this.isVisible = false
        this.isLoading = false
        this.notification.success('Thành công', 'Xóa File System thành công')
        this.onOk.emit()
      } else {
        this.isVisible = false
        this.isLoading = false
        this.notification.error('Thất bại', 'Xóa File System thất bại')
      }
    }, error => {
      this.isVisible = false
      this.isLoading = false
      this.notification.error('Thất bại', 'Xóa File System thất bại')
    })
  }
}
