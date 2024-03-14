import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VolumeService } from '../../../../../shared/services/volume.service';
import { FileSystemService } from '../../../../../shared/services/file-system.service';

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
  }
}
