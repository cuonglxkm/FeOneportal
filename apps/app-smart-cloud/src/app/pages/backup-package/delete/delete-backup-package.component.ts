import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {PackageBackupService} from "../../../shared/services/package-backup.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {NonNullableFormBuilder} from "@angular/forms";
import {PackageBackupModel} from "../../../shared/models/package-backup.model";

@Component({
  selector: 'one-portal-delete-backup-package',
  templateUrl: './delete-backup-package.component.html',
  styleUrls: ['./delete-backup-package.component.less'],
})
export class DeleteBackupPackageComponent {
  @Input() isVisible: boolean
  @Input() region: number
  @Input() project: number
  @Input() isLoading: boolean
  @Input() packageBackupModel: PackageBackupModel
  @Output() onCancel = new EventEmitter<void>()
  @Output() onOk = new EventEmitter<void>()

  value: string
  constructor(private router: Router,
              private packageBackupService: PackageBackupService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private route: ActivatedRoute,
              private fb: NonNullableFormBuilder) {
  }

  handleOk() {

    this.isLoading = true
    if(this.value.trim().includes(this.packageBackupModel?.packageName)){
      this.packageBackupService.delete(this.packageBackupModel?.id).subscribe(data => {
        if(data == true){
          this.isLoading = false
          this.isVisible = false
          this.notification.success('Thành công', 'Xóa gói backup thành công')
          this.onOk.emit();
        } else {
          this.isLoading = false
          this.isVisible = false
          this.notification.error('Thất bại', 'Xóa gói backup thất bại')
          this.onOk.emit();
        }
      })
    } else {
      this.notification.error('Error', 'Vui lòng nhập đúng thông tin')
    }

  }

  handleCancel() {
    this.isVisible = false
    this.onCancel.emit();
  }

  onInputChange() {
    console.log('input change', this.value)
  }


}
