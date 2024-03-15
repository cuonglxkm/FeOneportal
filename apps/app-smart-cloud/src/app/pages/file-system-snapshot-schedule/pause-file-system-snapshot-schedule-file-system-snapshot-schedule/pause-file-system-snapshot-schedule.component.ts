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


@Component({
  selector: 'one-portal-pause-file-system-snapshot',
  templateUrl: './pause-file-system-snapshot-schedule.component.html',
  styleUrls: ['./pause-file-system-snapshot-schedule.component.less'],
})
export class PauseFileSystemSnapshotScheduleComponent{
  @Input() region; number
  @Input() project: number
  @Input() idIpFloating: number
  @Input() ip: string
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false

  validateForm: FormGroup<{
    ip: FormControl<string>
  }> = this.fb.group({
    ip: ['', [Validators.required]]
  });

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              // private ipFloatingService: IpFloatingService,
              private fb: NonNullableFormBuilder) {
  }

  showModal(){
    this.isVisible = true
  }

  handleCancel(){
    this.isVisible = false
    this.isLoading =  false
  }

  // handleOk() {
  //   this.isLoading = true
  //   if(this.validateForm.valid) {
  //     if(this.ip.includes(this.validateForm.controls.ip.value)){
  //       this.ipFloatingService.deleteIp(this.idIpFloating).subscribe(data => {
  //         if(data) {
  //           this.isVisible = false
  //           this.isLoading =  false
  //           this.notification.success('Thành công', 'Xoá IP Floating thành công')
  //           this.onOk.emit(data)
  //         }
  //       }, error => {
  //         this.isVisible = false
  //         this.isLoading =  false
  //         this.notification.success('Thất bại', 'Xoá IP Floating thất bại')
  //       })
  //     }
  //   }
  // }

  
}
