import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { RegionModel } from 'src/app/shared/models/region.model';
import { CreateScheduleSnapshotDTO } from 'src/app/shared/models/snapshotvl.model';
import { ProjectService } from 'src/app/shared/services/project.service';
import { AppValidator } from '../../../../../../../libs/common-utils/src';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { getCurrentRegionAndProject } from '@shared';
import { FormCreateFileSystemSsSchedule } from 'src/app/shared/models/filesystem-snapshot-schedule';
import { FileSystemSnapshotScheduleService } from 'src/app/shared/services/file-system-snapshot-schedule.service';
import { FormAction } from 'src/app/shared/models/schedule.model';


@Component({
  selector: 'one-portal-delete-file-system-snapshot-schedule',
  templateUrl: './delete-file-system-snapshot-schedule.component.html',
  styleUrls: ['./delete-file-system-snapshot-schedule.component.less'],
})
export class DeleteFileSystemSnapshotScheduleComponent{
  @Input() idIpFloating: number
  @Input() ip: string
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false
  formDelete: FormAction = new FormAction()
  validateForm: FormGroup<{
    name: FormControl<string>
  }> = this.fb.group({
    name: ['', [Validators.required]]
  });

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private fb: NonNullableFormBuilder,
              private fileSystemSnapshotSchedule: FileSystemSnapshotScheduleService
              ) {
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
      // if(this.ip.includes(this.validateForm.controls.name.value)){
        
        this.fileSystemSnapshotSchedule.delete(3, 1).subscribe(data => {
          if(data) {
            this.isVisible = false
            this.isLoading =  false
            this.notification.success('Thành công', 'Xoá IP Floating thành công')
            this.onOk.emit(data)
          }
        }, error => {
          this.isVisible = false
          this.isLoading =  false
          this.notification.success('Thất bại', 'Xoá IP Floating thất bại')
        })
      // }
    }
  }

  
}
