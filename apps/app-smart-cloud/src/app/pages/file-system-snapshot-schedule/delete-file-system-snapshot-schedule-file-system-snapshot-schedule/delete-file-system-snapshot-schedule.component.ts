import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FileSystemSnapshotScheduleService } from 'src/app/shared/services/file-system-snapshot-schedule.service';


@Component({
  selector: 'one-portal-delete-file-system-snapshot-schedule',
  templateUrl: './delete-file-system-snapshot-schedule.component.html',
  styleUrls: ['./delete-file-system-snapshot-schedule.component.less'],
})
export class DeleteFileSystemSnapshotScheduleComponent{
  @Input() scheduleId: number
  @Input() scheduleName: string
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false
  validateForm: FormGroup<{
    name: FormControl<string>
  }> = this.fb.group({
    name: ['', [Validators.required, this.nameScheduleValidator.bind(this)]]
  });

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private fb: NonNullableFormBuilder,
              private fileSystemSnapshotSchedule: FileSystemSnapshotScheduleService
              ) {
  }

  nameScheduleValidator(control: FormControl): { [key: string]: any } | null {
    const name = control.value;
    if (name !== this.scheduleName) {
      return { 'nameMismatch': true };
    }
    return null;
  }

  showModal(){
    this.isVisible = true
  }

  handleCancel(){
    this.isVisible = false
    this.isLoading =  false
  }


  handleOk() {
    this.isLoading = true
    if(this.validateForm.valid) {     
        this.fileSystemSnapshotSchedule.delete(this.scheduleId).subscribe(data => {
            this.isVisible = false
            this.isLoading =  false
            this.notification.success('Thành công', 'Xoá lịch FileSystem Snapshot thành công')
            this.onOk.emit(data)
        }, error => {
          this.isVisible = false
          this.isLoading =  false
          this.notification.error('Thất bại', 'Xoá lịch FileSystem Snapshot thất bại')
        })
    }
  } 
}
