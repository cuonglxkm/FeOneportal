import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BackupList } from '../../../../model/backup-list.model';
import { BackupDetail } from '../../../../model/backup-detail.model';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { MongodbDetail } from 'apps/app-mongodb-replicaset/src/app/model/mongodb-detail.model';

@Component({
  selector: 'app-backup-plan',
  templateUrl: './backup-plan.component.html',
  styleUrls: ['./backup-plan.component.css']
})
export class BackupPlanComponent implements OnInit {

  @Input() service?: MongodbDetail;
  @Input() serviceSelected?: BackupList;
  @Input() isEdit?: boolean;

  myForm!: FormGroup;

  isSubmitting: boolean = false;

  weekly_day_in_week_error: boolean = false;

  backupDetail ?: BackupDetail;
  daysArray: number[] = [];

  constructor(private fb: FormBuilder,
    private drawerRef: NzDrawerRef,
  ) { }

  ngOnInit(): void {
    console.log("service: ",this.service," | serviceSelected: ",this.serviceSelected, " | isEdit: ",this.isEdit);

    this.handleFormValidate();
    if (this.isEdit) {
      // Base.showLoading()
      // this.backupService.getBackupDetail(this.serviceSelected.id)
      //   .subscribe(r => {
      //     this.backupDetail = r;
      //     this.handleEditFormValidate(this.backupDetail);
      //   });
    }

  }

  handleEditFormValidate(data: BackupDetail) {
    // this.myForm.controls.schedule_type.setValue(data.auto_manual_schedule);
    // if (data.auto_manual_schedule == 0) {
    //   this.daysArray= data.weekly_day?.split(',').map(Number);
    //   this.myForm.controls.backup_type.setValue(data.backup_type);
    //   this.myForm.controls.schedule_name.setValue(data.schedule_name);
    //   this.myForm.controls.backup_expiry.setValue(data.backup_expiry);
    //   this.myForm.controls.period_schedule.setValue(data.period_schedule);
    //   let minutes: number = 0;
    //   let hours: number = 0;
    //   switch (data.period_schedule) {
    //     case 0:
    //       minutes = data.hour_minutes
    //       break;
    //     case 1:
    //       minutes = data.daily_minutes;
    //       hours = data.daily_hour;
    //       break;
    //     case 2:
    //       minutes = data.weekly_minutes;
    //       hours = data.weekly_hour;
    //       break;
    //     case 3:
    //       minutes = data.monthly_minute;
    //       hours = data.monthly_hour;
    //       break;
    //     default:
    //       break;
    //   }
    //   this.myForm.controls.minutes_param.setValue(minutes);
    //   this.myForm.controls.hours_param.setValue(hours);
    //   this.myForm.controls.monthly_type.setValue(data.monthly_type?data.monthly_type:0);
    //   this.myForm.controls.keep_number.setValue(data.keep_number);
    //   this.myForm.controls.minutes_param.setValue(minutes);
    //   console.log(this.myForm.controls.weekly_day_in_week_param.value);

    //   this.myForm.controls.weekly_day_in_week_param.setValue(data.weekly_day);
    //   this.myForm.controls.monthly_day_in_week_param.setValue(data.monthly_day ? data.monthly_day : 2);
    //   this.myForm.controls.monthly_day_in_month_param.setValue(data.monthly_day ? data.monthly_day : 1);
    //   this.myForm.updateValueAndValidity();
    // }
    // Base.hideLoading()
  }

  handleFormValidate() {
    this.myForm = this.fb.group({
      schedule_type: [0, [Validators.required]],
      backup_type: [0, [Validators.required]],
      schedule_name: [null, [Validators.required, Validators.pattern(/^[a-zA-Z0-9-]+$/), Validators.maxLength(50)]],
      backup_expiry: [null, Validators.compose([Validators.required, this.validNumberInt, Validators.min(1), Validators.max(12)])],
      period_schedule: [0, [Validators.required]],
      minutes_param: [0, [Validators.required]],
      hours_param: [0, [Validators.required]],
      weekly_day_in_week_param: [''],
      monthly_type: [0, [Validators.required]],
      monthly_day_in_week_param: [2, [Validators.required]],
      monthly_day_in_month_param: [1, [Validators.required]],
      keep_number: [null, Validators.compose([Validators.required, this.validNumberInt, Validators.min(1), Validators.max(30)])],
    });
  }

  validNumberInt(control: AbstractControl): { [key: string]: any; } {
    if (isNaN(control.value)) {
      return { invalidNumber: true };
    }
    const n = +control.value;
    if (n <= 0 || n > 1e9 || n !== Math.floor(n)) {
      return { invalidNumber: true };
    }
    return {};
  }

  changeBackupType() {
  //   if (this.myForm.get('schedule_type').value == 0) {
  //     this.myForm.get('keep_number').setValidators([Validators.required]);
  //   } else {
  //     this.myForm.get('keep_number').clearValidators();
  //   }
  //   this.resetFormValue();
  }

  resetFormPeriodScheduleParams() {
  //   this.myForm.get('minutes_param').setValue(0);
  //   this.myForm.get('hours_param').setValue(0);
  //   this.myForm.get('weekly_day_in_week_param').setValue('');
  //   this.myForm.get('monthly_type').setValue(0);
  //   this.myForm.get('monthly_day_in_week_param').setValue(2);
  //   this.myForm.get('monthly_day_in_month_param').setValue(1);

  //   this.weekly_day_in_week_error = false;
  }

  // resetFormValue() {
  //   this.myForm.get("backup_type").setValue(0);
  //   this.myForm.get('schedule_name').setValue('');
  //   this.myForm.get('backup_expiry').setValue(null);
  //   this.myForm.get('period_schedule').setValue(0);
  //   this.myForm.get('keep_number').setValue(null);

  //   this.resetFormPeriodScheduleParams();
  // }

  get period_schedule(): number {
    return this.myForm.get('period_schedule')?.value;
  }

  get monthly_type(): number {
    return this.myForm.get('monthly_type')?.value;
  }

  get schedule_type(): number {
    return this.myForm.get('schedule_type')?.value;
  }

  // validateWeeklyDayInWeekParam() {
  //   this.weekly_day_in_week_error = !this.myForm.get('weekly_day_in_week_param').value;
  // }

  changeCheckboxDays(event: Event) {
  //   const target = event.target as HTMLInputElement;
  //   const checked = target.checked;
  //   const idx: string = target.value;

  //   const prevValue: string = this.myForm.get('weekly_day_in_week_param').value;
  //   let curValue = '';
  //   if (checked) {
  //     if (!prevValue || prevValue.length == 0) {
  //       curValue = idx;
  //     } else {
  //       curValue = prevValue + ',' + idx;
  //     }

  //   } else {
  //     let ids: string[] = (prevValue ?? '').split(',');
  //     ids = ids.filter(id => id != idx);
  //     curValue = ids.join(',');
  //   }
  //   this.myForm.get('weekly_day_in_week_param').setValue(curValue);

  //   this.validateWeeklyDayInWeekParam();
  }

  // triggerValidateFormControl(control: AbstractControl) {
  //   control.markAsDirty();
  //   control.updateValueAndValidity();
  // }

  submitForm() {

  //   if (this.myForm.get('schedule_type').value == BackupTypeEnum.AUTO) {
  //     for (const field in this.myForm.controls) {
  //       const control = this.myForm.get(field);
  //       this.triggerValidateFormControl(control);
  //     }
  //     if (this.myForm.get('period_schedule').value == 2) { // Weekly
  //       this.validateWeeklyDayInWeekParam();
  //     }
  //   } else {
  //     this.triggerValidateFormControl(this.myForm.get('backup_type'));
  //     this.triggerValidateFormControl(this.myForm.get('schedule_name'));
  //     this.triggerValidateFormControl(this.myForm.get('backup_expiry'));
  //   }

  //   // for (const field in this.myForm.controls) {
  //   //   const control = this.myForm.get(field);
  //   //   console.log(field + ": " + control.value + ": " + control.valid);
  //   // }

  //   let backupCreateReq: BackupCreateReq = new BackupCreateReq();

  //   if (this.myForm.valid && !this.weekly_day_in_week_error) {

  //     this.isSubmitting = true;

  //     backupCreateReq.service_order_code = this.service.service_order_code;

  //     backupCreateReq.backup_type = this.myForm.get('backup_type').value;
  //     backupCreateReq.schedule_name = this.myForm.get('schedule_name').value;
  //     backupCreateReq.auto_manual_schedule = this.myForm.get('schedule_type').value;
  //     backupCreateReq.backup_expiry = this.myForm.get('backup_expiry').value;

  //     if (backupCreateReq.auto_manual_schedule == BackupTypeEnum.AUTO) {
  //       backupCreateReq.period_schedule = this.myForm.get('period_schedule').value;
  //       backupCreateReq.keep_number = this.myForm.get('keep_number').value;
  //       switch (backupCreateReq.period_schedule) {
  //         case BackupPeriodEnum.HOURLY:
  //           backupCreateReq.hour_minutes = this.myForm.get('minutes_param').value;
  //           break;
  //         case BackupPeriodEnum.DAILY:
  //           backupCreateReq.daily_hour = this.myForm.get('hours_param').value;
  //           backupCreateReq.daily_minutes = this.myForm.get('minutes_param').value;
  //           break;
  //         case BackupPeriodEnum.WEEKLY:
  //           backupCreateReq.weekly_day = this.myForm.get('weekly_day_in_week_param').value;
  //           backupCreateReq.weekly_hour = this.myForm.get('hours_param').value;
  //           backupCreateReq.weekly_minutes = this.myForm.get('minutes_param').value;
  //           break;
  //         case BackupPeriodEnum.MONTHLY:

  //           backupCreateReq.monthly_type = this.myForm.get("monthly_type").value;
  //           backupCreateReq.monthly_day = backupCreateReq.monthly_type == 0
  //             ? this.myForm.get('monthly_day_in_month_param').value
  //             : this.myForm.get('monthly_day_in_week_param').value;
  //           backupCreateReq.monthly_hour = this.myForm.get('hours_param').value;
  //           backupCreateReq.monthly_minute = this.myForm.get('minutes_param').value;
  //           break;
  //         default:
  //           break;
  //       }
  //     }
  //     if (this.isEdit) {
  //       backupCreateReq.id = this.serviceSelected.id;
  //       backupCreateReq.is_edit = true;
  //       this.backupService.createBackupSchedule(backupCreateReq)
  //         .pipe(finalize(() => {
  //           this.isSubmitting = false;
  //           this.backupService.notifyRefreshBackupList();
  //           this.drawerRef.close();
  //         }))
  //         .subscribe(r => {
  //         });
  //     }
  //     else {
  //       backupCreateReq.is_edit = false;
  //       this.backupService.createBackupSchedule(backupCreateReq)
  //         .pipe(finalize(() => {
  //           this.isSubmitting = false;
  //           this.backupService.notifyRefreshBackupList();
  //           this.drawerRef.close();
  //         }))
  //         .subscribe(r => {
  //         });
      }



      // const mode = BackupOperation.CREATE;
      // const backup = new BackupList();
      // backup.id = -1;
      // backup.schedule_name = backupCreateReq.schedule_name;

      // this.backupService.sendOtpBackup(mode, this.service.service_order_code, backup.id, backup.schedule_name)
      //   .pipe(finalize(() => this.isSubmitting = false))
      //   .subscribe(r => {
      //     if (r && r.code == 200) {
      //       // open otp modal
      //       this.modalService.create({
      //         vTitle: 'Khởi tạo lịch backup',
      //         vFooter: null,
      //         vContent: BackupOtpComponent,
      //         vComponentParams: {
      //           service: this.service,
      //           backup: backup,
      //           mode: mode,
      //           titleOtp: r.msg,
      //           keyCheckOtp: r.data,
      //           data: {data: {...backupCreateReq}, mode},
      //           drawerRef: this.drawerRef
      //         },
      //         vMaskClosable: true

      //       })
      //     }
      //   });


  //   }
  // }

  closeAddBackup() {
    this.drawerRef.close()
  }
}
