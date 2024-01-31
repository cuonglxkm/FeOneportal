import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {PackageBackupService} from "../../../shared/services/package-backup.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {NonNullableFormBuilder} from "@angular/forms";

@Component({
  selector: 'one-portal-delete-backup-package',
  templateUrl: './delete-backup-package.component.html',
  styleUrls: ['./delete-backup-package.component.less'],
})
export class DeleteBackupPackageComponent implements OnInit{
  @Input() isVisible: boolean
  @Input() region: number
  @Input() project: number
  @Input() id: number
  @Input() isLoading: boolean
  @Output() onCancel = new EventEmitter<void>()
  @Output() onOk = new EventEmitter<void>()

  namePackage: string
  value: string
  constructor(private router: Router,
              private packageBackupService: PackageBackupService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private route: ActivatedRoute,
              private fb: NonNullableFormBuilder) {
  }

  showModalDelete() {
    this.isVisible = true
  }

  handleOk() {
    this.onOk.emit();
  }

  handleCancel() {
    this.isVisible = false
    this.onCancel.emit();
  }

  onInputChange() {
    console.log('input change', this.value)
  }


  getDetailPackageBackup(id) {
    this.packageBackupService.detail(id).subscribe(data => {
      console.log('data', data)
      this.namePackage = data.packageName
    })
  }

  ngOnInit() {
    // this.getDetailPackageBackup(this.id)
  }
}
