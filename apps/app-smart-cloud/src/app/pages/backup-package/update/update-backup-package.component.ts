import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { PackageBackupService } from '../../../shared/services/package-backup.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { FormUpdate, PackageBackupModel } from '../../../shared/models/package-backup.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

@Component({
  selector: 'one-portal-update-backup-package',
  templateUrl: './update-backup-package.component.html',
  styleUrls: ['./update-backup-package.component.less']
})
export class UpdateBackupPackageComponent implements AfterViewInit{
  @Input() region: number;
  @Input() project: number;
  @Input() idBackupPackage: number;
  @Input() backupPackage: PackageBackupModel;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onOk = new EventEmitter<void>();

  isLoading: boolean = false;
  isVisible: boolean = false;

  validateForm: FormGroup<{
    namePackage: FormControl<string>
    description: FormControl<string>
  }> = this.fb.group({
    namePackage: [null as string, [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9]*$/),
      Validators.maxLength(70)]],
    description: [null as string, [Validators.maxLength(255)]]
  });

  nameList: string[] = [];

  @ViewChild('backupPackageInputName') backupPackageInputName!: ElementRef<HTMLInputElement>;

  constructor(private notification: NzNotificationService,
              private backupPackageService: PackageBackupService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private fb: NonNullableFormBuilder,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,) {
  }

  ngAfterViewInit(): void {
    this.backupPackageInputName?.nativeElement.focus();
  }

  focusOkButton(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleOk();
    }
  }

  duplicateNameValidator(control) {
    const value = control.value;
    // Check if the input name is already in the list
    if (this.nameList && this.nameList.includes(value)) {
      return { duplicateName: true }; // Duplicate name found
    } else {
      return null; // Name is unique
    }
  }

  getAllBackupPackage(){
    this.backupPackageService.search(null, null, 9999, 1).subscribe(data => {
      data.records.forEach((item) => {
        if (this.nameList.length > 0) {
          this.nameList.push(item.packageName);
        } else {
          this.nameList = [item.packageName];
        }
      });
      this.nameList.forEach(item => {
        const index = this.nameList.indexOf(this.validateForm.controls.namePackage.value);
        // Nếu giá trị có tồn tại trong mảng, loại bỏ nó
        if (index !== -1) {
          this.nameList.splice(index, 1);
        }
      });
    }, error => {
      this.nameList = []
    })
  }

  showModal() {
    this.isVisible = true;
    this.isLoading = false;
    this.getAllBackupPackage();
    this.validateForm.controls.namePackage.setValue(this.backupPackage?.packageName);
    this.validateForm.controls.description.setValue(this.backupPackage?.description);
    setTimeout(() => {
      this.backupPackageInputName?.nativeElement.focus();
    }, 1000);
  }

  handleCancel() {
    this.isLoading = false;
    this.isVisible = false;
    this.validateForm.reset();
    this.onCancel.emit();
  }

  handleOk() {
    this.isLoading = true
    let formUpdate = new FormUpdate()
    formUpdate.packageId = this.idBackupPackage;
    formUpdate.packageName = this.validateForm.controls.namePackage.value;
    formUpdate.description = this.validateForm.controls.description.value;
    formUpdate.customerId = this.tokenService.get()?.userId;

    this.backupPackageService.update(formUpdate).subscribe(data => {
      this.isLoading = false
      this.isVisible = false
      this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.notification.update.package.backup.success') )
    }, error => {
      this.isLoading = false
      this.isVisible = false
      this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.notification.update.package.backup.error', {error: error.error.detail}))
    })
    this.onOk.emit();
  }
}
