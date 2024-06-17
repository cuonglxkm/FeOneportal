import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { I18NService } from '@core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormDeleteFileSystemSnapshot } from 'src/app/shared/models/filesystem-snapshot';
import { FileSystemSnapshotService } from 'src/app/shared/services/filesystem-snapshot.service';


@Component({
  selector: 'one-portal-delete-file-system-snapshot',
  templateUrl: './delete-file-system-snapshot.component.html',
  styleUrls: ['./delete-file-system-snapshot.component.less'],
})
export class DeleteFileSystemSnapshotComponent{
  @Input() region; number
  @Input() project: number
  @Input() filesystemsnapshotId: number
  @Input() filesystemsnapshotName: string
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false

  validateForm: FormGroup<{
    name: FormControl<string>
  }> = this.fb.group({
    name: ['', [Validators.required, this.nameVpnConnectionValidator.bind(this)]]
  });

  nameVpnConnectionValidator(control: FormControl): { [key: string]: any } | null {
    const name = control.value;
    if (name !== this.filesystemsnapshotName) {
      return { 'nameMismatch': true };
    }
    return null;
  }

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private notification: NzNotificationService,
              private fb: NonNullableFormBuilder,
              private fileSystemSnapshotService: FileSystemSnapshotService) {
  }

  showModal(){
    this.isVisible = true
  }

  handleCancel(){
    this.isVisible = false
    this.isLoading =  false
    this.validateForm.reset()
  }

  handleOk() {
    this.isLoading = true
    let formDelete = new FormDeleteFileSystemSnapshot()
    formDelete.id = this.filesystemsnapshotId
    formDelete.customerId = this.tokenService.get()?.userId;
    formDelete.regionId = this.region
    console.log(formDelete);
    
    if(this.validateForm.valid) {
      if(this.filesystemsnapshotName.includes(this.validateForm.controls.name.value)){
        this.fileSystemSnapshotService.deleteFileSystemSnapshot(formDelete).subscribe(data => {
          if(data) {
            this.isVisible = false
            this.isLoading =  false
            // this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.file.snapshot.delete.success'))
            this.validateForm.reset()
            this.onOk.emit(data)
          }
        }, error => {
          this.isVisible = false
          this.isLoading =  false
          this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.file.snapshot.delete.fail'))
        })
      }
    }
  }

  
}
