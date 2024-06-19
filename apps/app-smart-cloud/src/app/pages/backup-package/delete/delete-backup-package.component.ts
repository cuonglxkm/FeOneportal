import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PackageBackupService } from '../../../shared/services/package-backup.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NonNullableFormBuilder } from '@angular/forms';
import { PackageBackupModel, ServiceInPackage } from '../../../shared/models/package-backup.model';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { FormDeleteFileSystem } from '../../../shared/models/file-system.model';

@Component({
  selector: 'one-portal-delete-backup-package',
  templateUrl: './delete-backup-package.component.html',
  styleUrls: ['./delete-backup-package.component.less']
})
export class DeleteBackupPackageComponent implements AfterViewInit{
  @Input() region: number;
  @Input() project: number;
  @Input() packageBackupModel: PackageBackupModel;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onOk = new EventEmitter<void>();

  isVisible: boolean = false
  isLoading: boolean = false

  value: string = '';

  isInput: boolean = false;

  serviceInBackupPackage: ServiceInPackage = new ServiceInPackage();

  @ViewChild('backupPackageInputName') backupPackageInputName!: ElementRef<HTMLInputElement>;

  constructor(private router: Router,
              private packageBackupService: PackageBackupService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private route: ActivatedRoute,
              private fb: NonNullableFormBuilder,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
  }

  handleOk() {
    this.isLoading = true;
    if (this.value == this.packageBackupModel?.packageName) {
      this.isInput = false;
      this.packageBackupService.delete(this.packageBackupModel?.id, this.region, this.project).subscribe(data => {
        this.isLoading = false;
        this.isVisible = false;
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.notification.delete.package.success'));
        this.onOk.emit();
      }, error => {
        this.isLoading = false;
        this.isVisible = false;
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.notification.delete.package.fail', error.error.detail) );
      });
    } else {
      this.isInput = true;
      this.isLoading = false;
    }

  }

  handleCancel() {
    this.isVisible = false;
    this.isLoading = false;
    this.value = '';
    this.isInput = false
    this.onCancel.emit();
  }

  onInputChange(value) {
    this.value = value
    console.log('input change', this.value);
  }

  focusOkButton(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleOk();
    }
  }

  showModal() {
    this.isVisible = true;
    this.getServiceFromPackage();
    setTimeout(() => {
      this.backupPackageInputName?.nativeElement.focus();
    }, 1000);
  }

  getServiceFromPackage() {
    this.packageBackupService.getServiceInPackage(this.packageBackupModel?.id).subscribe(data => {
      this.serviceInBackupPackage = data
    })
  }
  ngAfterViewInit() {
    this.backupPackageInputName?.nativeElement.focus();
  }


}
