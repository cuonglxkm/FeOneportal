import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Router } from '@angular/router';
import { BackupVmService } from '../../../shared/services/backup-vm.service';
import { BackupVm, BackupVMFormSearch, FormUpdateBackupVm } from '../../../shared/models/backup-vm';
import { FormUpdateBackupVolume } from '../../volume/component/backup-volume/backup-volume.model';

@Component({
  selector: 'one-portal-update-backup-vm',
  templateUrl: './update-backup-vm.component.html',
  styleUrls: ['./update-backup-vm.component.less']
})
export class UpdateBackupVmComponent implements AfterViewInit {
  @Input() region: number;
  @Input() project: number;
  @Input() idBackupVm: number;
  @Input() backupName: string;
  @Input() backupVmInfo: BackupVm;
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();

  isLoading: boolean = false;
  isVisible: boolean = false;

  validateForm: FormGroup<{
    nameBackup: FormControl<string>
    description: FormControl<string>
  }> = this.fb.group({
    nameBackup: [null as string, [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9-_]+$/),
      Validators.maxLength(50), this.duplicateNameValidator.bind(this)]],
    description: [null as string, [Validators.maxLength(255)]]
  });

  nameList: string[] = [];

  @ViewChild('backupVmInputName') backupVmInputName!: ElementRef<HTMLInputElement>;

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private fb: NonNullableFormBuilder,
              private backupVmService: BackupVmService,
              private notification: NzNotificationService,
              private router: Router) {
  }

  ngAfterViewInit(): void {
    this.backupVmInputName?.nativeElement.focus();
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

  focusOkButton(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleOk();
    }
  }

  showModal() {
    this.isVisible = true;
    this.validateForm.controls.nameBackup.setValue(this.backupVmInfo?.name)
    this.validateForm.controls.description.setValue(this.backupVmInfo?.description)
    this.getListBackupVM();
    // this.validateForm.controls.nameFileSystem.setValue(this.fileSystem?.name);
    // this.validateForm.controls.description.setValue(this.fileSystem?.description);
    setTimeout(() => {
      this.backupVmInputName?.nativeElement.focus();
    }, 1000);
  }

  getListBackupVM() {
    this.isLoading = true
    let formSearch: BackupVMFormSearch = new BackupVMFormSearch()
    formSearch.regionId = this.region
    formSearch.projectId = this.project
    formSearch.customerId = this.tokenService.get()?.userId
    formSearch.currentPage = 1
    formSearch.pageSize = 9999

    this.backupVmService.search(formSearch).subscribe(data => {
      this.isLoading = false
      data?.records.forEach(item => {
        this.nameList?.push(item.name)
        this.nameList = this.nameList.filter(item => item !==  this.validateForm.get('nameBackup').getRawValue())
      })

    }, error => {
      this.isLoading = false
      this.notification.error(this.i18n.fanyi('app.status.fail'), error.error.detail)
    })

  }


  handleCancel() {
    this.isVisible = false;
    this.isLoading = false;
    this.validateForm.reset()
    this.onCancel.emit();
  }

  handleOk() {
    this.isLoading = true

    let formUpdate = new FormUpdateBackupVm()
    formUpdate.instanceBackupId = this.idBackupVm
    formUpdate.name = this.validateForm.controls.nameBackup.value.trimStart().trimEnd()
    formUpdate.description = this.validateForm.controls.description.value.trimStart().trimEnd()
    this.backupVmService.update(formUpdate).subscribe(data => {
      this.isLoading = false
      this.isVisible = false
      this.notification.success(this.i18n.fanyi('app.status.success'), 'Chỉnh sửa Backup VM thành công')
    }, error => {
      this.isLoading = false
      this.isVisible = false
      this.notification.error(this.i18n.fanyi('app.status.fail'), 'Chỉnh sửa Backup VM thất bại. ' + error.error.detail)
    })
    this.onOk.emit()
  }
}
