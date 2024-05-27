import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { BackupVm, BackupVMFormSearch } from '../../../../../shared/models/backup-vm';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { BackupVmService } from '../../../../../shared/services/backup-vm.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Router } from '@angular/router';
import { BackupVolume } from '../backup-volume.model';
import { BackupVolumeService } from '../../../../../shared/services/backup-volume.service';

@Component({
  selector: 'one-portal-update-backup-volume',
  templateUrl: './update-backup-volume.component.html',
  styleUrls: ['./update-backup-volume.component.less'],
})
export class UpdateBackupVolumeComponent implements AfterViewInit{
  @Input() region: number;
  @Input() project: number;
  @Input() idBackupVolume: number;
  @Input() backupName: string;
  @Input() backupVolume: BackupVolume;
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

  @ViewChild('backupVolumeInputName') backupVolumeInputName!: ElementRef<HTMLInputElement>;

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private fb: NonNullableFormBuilder,
              private backupVolumeService: BackupVolumeService ,
              private notification: NzNotificationService,
              private router: Router) {
  }

  ngAfterViewInit(): void {
    this.backupVolumeInputName?.nativeElement.focus();
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

    this.getListBackupVolume()
    this.validateForm.controls.nameBackup.setValue(this.backupVolume?.name)
    this.validateForm.controls.description.setValue(this.backupVolume?.description)

    setTimeout(() => {
      this.backupVolumeInputName?.nativeElement.focus();
    }, 1000);
  }

  getListBackupVolume() {

    let formSearch: BackupVMFormSearch = new BackupVMFormSearch()
    formSearch.regionId = this.region
    formSearch.projectId = this.project
    formSearch.customerId = this.tokenService.get()?.userId
    formSearch.currentPage = 1
    formSearch.pageSize = 9999

    // this.backupVolumeService.getListBackupVolume(null).subscribe(data => {
    //   this.isLoading = false
    //   data?.records.forEach(item => {
    //     this.nameList?.push(item.name)
    //     this.nameList = this.nameList.filter(item => item !==  this.validateForm.get('nameBackup').getRawValue())
    //   })
    //
    // }, error => {
    //   this.isLoading = true
    //   this.notification.error(this.i18n.fanyi('app.status.fail'), error.error.detail)
    // })

  }


  handleCancel() {
    this.isVisible = false;
    this.isLoading = false;
    this.validateForm.reset()
    this.onCancel.emit();
  }

  handleOk() {

  }
}
