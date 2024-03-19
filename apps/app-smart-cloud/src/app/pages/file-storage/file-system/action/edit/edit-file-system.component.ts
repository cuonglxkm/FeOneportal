import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { FileSystemDetail, FormEditFileSystem } from '../../../../../shared/models/file-system.model';
import { FileSystemService } from '../../../../../shared/services/file-system.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Router } from '@angular/router';

@Component({
  selector: 'one-portal-edit-file-system',
  templateUrl: './edit-file-system.component.html',
  styleUrls: ['./edit-file-system.component.less'],
})
export class EditFileSystemComponent {
  @Input() region: number
  @Input() project: number
  @Input() fileSystemId: number
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isLoading: boolean = false
  isVisible: boolean = false
  isLoadingUpdate: boolean = false

  validateForm: FormGroup<{
    nameFileSystem: FormControl<string>
    description: FormControl<string>
  }> = this.fb.group({
    nameFileSystem: [null as string, [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9_]+$/),
      Validators.maxLength(70)]],
    description: [null as string, [Validators.maxLength(255)]]
  })

  fileSystem: FileSystemDetail = new FileSystemDetail()

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private fb: NonNullableFormBuilder,
              private fileSystemService: FileSystemService,
              private notification: NzNotificationService,
              private router: Router){
  }

  showModal() {
    this.isVisible = true
    this.getFileSystemById()
  }



  handleCancel() {
    this.isVisible = false
    this.isLoadingUpdate = false
    this.onCancel.emit()
  }

  getFileSystemById() {
    this.isLoading = true
    this.fileSystemService.getFileSystemById(this.fileSystemId, this.region).subscribe(data => {
      this.fileSystem = data
      this.validateForm.controls.nameFileSystem.setValue(data.name)
      this.validateForm.controls.description.setValue(data.description)
      this.isLoading = false
    }, error => {
      this.fileSystem = null
      this.isLoading = false
    })
  }
  handleOk() {
    this.isLoadingUpdate = true
    let formEdit = new FormEditFileSystem()
    formEdit.id = this.fileSystemId
    formEdit.regionId = this.region
    formEdit.customerId = this.tokenService.get()?.userId
    formEdit.name = this.validateForm.controls.nameFileSystem.value
    formEdit.description = this.validateForm.controls.description.value
    this.fileSystemService.edit(formEdit).subscribe(data => {
      if(data) {
        this.isLoadingUpdate = false
        this.notification.success('Thành công', 'Cập nhật File System thành công')
        this.router.navigate(['/app-smart-cloud/file-storage/file-system/list'])
      } else {
        this.isLoadingUpdate = false
        this.notification.error('Thất bại', 'Cập nhật File System thất bại')
      }
    }, error => {
      this.isLoadingUpdate = false
      this.notification.error('Thất bại', 'Cập nhật File System thất bại')
    })
  }
}
