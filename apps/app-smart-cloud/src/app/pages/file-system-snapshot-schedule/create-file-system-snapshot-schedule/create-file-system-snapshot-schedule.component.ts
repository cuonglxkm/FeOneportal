import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
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
  selector: 'one-portal-create-file-system-snapshot',
  templateUrl: './create-file-system-snapshot-schedule.component.html',
  styleUrls: ['./create-file-system-snapshot-schedule.component.less'],
})
export class CreateFileSystemSnapshotScheduleComponent implements OnInit{
  
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));
  isLoading: boolean = false;
  customerId: number
  defaultOpenValue = new Date(0, 0, 0, 0, 0, 0);
  FileSystem: string[] = ['Apples', 'Nails', 'Bananas', 'Helicopters'];
  listOfSelectedValue: string[] = [];
  time: Date = new Date();
  nameSnapshot: string = ''
  snapshotRecord = 1;
  numberOfWeekSelected: string = ''
  daysOfWeekSelected: string = ''
  months: number = 1
  modeType: string = '0'
  listOfSelectedDate: string[] = [];
  dateDone: number = 1
  isVisibleCreate: boolean = false;
  dateOptions: NzSelectOptionInterface[] = [
    { label: 'Hằng ngày', value: '0' },
    { label: 'Theo thứ', value: '1' },
    { label: 'Theo tuần', value: '2' },
    { label: 'Theo tháng', value: '3' },
  ];

  daysOfWeek = [
    {label: 'Thứ 2', value: '1'},
    {label: 'Thứ 3', value: '2'},
    {label: 'Thứ 4', value: '3'},
    {label: 'Thứ 5', value: '4'},
    {label: 'Thứ 6', value: '5'},
    {label: 'Thứ 7', value: '6'},
    {label: 'Chủ nhật', value: '7'}
  ]
  numberOfWeek = [
    {label: '1 Tuần', value: '1'},
    {label: '2 Tuần', value: '2'},
    {label: '3 Tuần', value: '3'}
  ]


  FileSystemSnapshotForm: FormGroup<{
    name: FormControl<string>;
    listOfFileSystem: FormControl<string[]>,
    runtime: FormControl<Date>,
    mode: FormControl<string>,
    dayOfWeek: FormControl<string>,
    daysOfWeek: FormControl<string[]>,
    intervalWeek: FormControl<number>,
    intervalMonth: FormControl<number>,
    maxSnapshot: FormControl<number>,
    description: FormControl<string>,
    dates: FormControl<string>,
  }> = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9][a-zA-Z0-9-_ ]{0,254}$/)]],
    listOfFileSystem: [[] as string[], Validators.required],
    runtime: [new Date(), Validators.required],
    mode: [this.dateOptions[0].value as string, Validators.required],
    dayOfWeek: '',
    daysOfWeek: [[] as string[]],
    intervalWeek: [null as number],
    intervalMonth: [null as number, [Validators.required, Validators.pattern(/^[1-9]$|^1[0-9]$|^2[0-4]$/)]],
    maxSnapshot: [null as number, [Validators.required, Validators.min(1)]],
    description: ['', [Validators.maxLength(700)]],
    dates: [null as string, [Validators.required]],

  });


  isNotSelected(value: string): boolean {
    return this.listOfSelectedValue.indexOf(value) === -1;
  }
  
  
  snapshotMode = this.dateOptions[0].value;
  isNotSelectedDate(value: string): boolean {
    return this.listOfSelectedDate.indexOf(value) === -1;
  }
 
  getDayLabelMulti(selectedValue: string): string {
    const selectedDay = this.daysOfWeek.find(day => day.value === selectedValue);
    return selectedDay ? selectedDay.label : '';
}
getDayLabel(selectedValue: string): string {
  const selectedDay = this.daysOfWeek.find(day => day.value === selectedValue);
  return selectedDay ? selectedDay.label : '';
}

formCreateFileSystemSsSchedule: FormCreateFileSystemSsSchedule = new FormCreateFileSystemSsSchedule() 
  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
    console.log(this.region);
    
  }

  regionChange(region: RegionModel) {
    this.region = region.regionId
    this.projectService.getByRegion(this.region).subscribe(data => {
      if (data.length) {
        localStorage.setItem("projectId", data[0].id.toString())
        this.router.navigate(['/app-smart-cloud/file-system-snapshot-schedule/create'])
      }
    });
  }

  projectChange(project: ProjectModel) {
    this.project = project?.id
  }
  handleSubmit(): void {
    this.isVisibleCreate = true;    
  }

  handleCreate(){
    this.isVisibleCreate = false;
    this.isLoading = true
    if (this.FileSystemSnapshotForm.valid) {
      this.formCreateFileSystemSsSchedule = this.getData()
      console.log(this.formCreateFileSystemSsSchedule);
      this.formCreateFileSystemSsSchedule.runtime = this.datepipe.transform(this.FileSystemSnapshotForm.controls.runtime.value, 'yyyy-MM-ddTHH:mm:ss', 'vi-VI')
      this.fileSystemSnapshotScheduleService.create(this.formCreateFileSystemSsSchedule).subscribe(data => {
        this.notification.success('Thành công', 'Tạo mới lịch file system thành công')
      }, error => {
        this.notification.error('Thất bại', 'Tạo mới lịch file system thất bại')
        console.log(error);
      })  
    }
  }

  handleCancel() {
    this.isVisibleCreate = false;
  }

  getData(): any {
    this.formCreateFileSystemSsSchedule.customerId = this.tokenService.get()?.userId
    this.formCreateFileSystemSsSchedule.regionId = this.region
    this.formCreateFileSystemSsSchedule.projectId = this.project
    this.formCreateFileSystemSsSchedule.name = this.FileSystemSnapshotForm.controls.name.value
    this.formCreateFileSystemSsSchedule.description = this.FileSystemSnapshotForm.controls.description.value
    this.formCreateFileSystemSsSchedule.mode = parseInt(this.FileSystemSnapshotForm.controls.mode.value)
    this.formCreateFileSystemSsSchedule.dayOfWeek = this.FileSystemSnapshotForm.controls.dayOfWeek.value
    this.formCreateFileSystemSsSchedule.daysOfWeek = this.FileSystemSnapshotForm.controls.daysOfWeek.value
    this.formCreateFileSystemSsSchedule.description = this.FileSystemSnapshotForm.controls.description.value
    this.formCreateFileSystemSsSchedule.intervalWeek = this.FileSystemSnapshotForm.controls.intervalWeek.value
    this.formCreateFileSystemSsSchedule.dates = this.FileSystemSnapshotForm.controls.dates.value
    this.formCreateFileSystemSsSchedule.duration = 1
    this.formCreateFileSystemSsSchedule.runtime = this.FileSystemSnapshotForm.controls.runtime.value
    this.formCreateFileSystemSsSchedule.intervalMonth = this.FileSystemSnapshotForm.controls.intervalMonth.value
    this.formCreateFileSystemSsSchedule.maxSnapshot = this.FileSystemSnapshotForm.controls.maxSnapshot.value
    this.formCreateFileSystemSsSchedule.shareIds = [0]

    return this.formCreateFileSystemSsSchedule
  }

  modeChange(value: string) {
    this.FileSystemSnapshotForm.controls.dayOfWeek.clearValidators();
    this.FileSystemSnapshotForm.controls.dayOfWeek.markAsPristine();
    this.FileSystemSnapshotForm.controls.dayOfWeek.reset();

    this.FileSystemSnapshotForm.controls.daysOfWeek.clearValidators();
    this.FileSystemSnapshotForm.controls.daysOfWeek.markAsPristine();
    this.FileSystemSnapshotForm.controls.daysOfWeek.reset();

    this.FileSystemSnapshotForm.controls.intervalWeek.clearValidators();
    this.FileSystemSnapshotForm.controls.intervalWeek.markAsPristine();
    this.FileSystemSnapshotForm.controls.intervalWeek.reset();

    this.FileSystemSnapshotForm.controls.intervalMonth.clearValidators();
    this.FileSystemSnapshotForm.controls.intervalMonth.markAsPristine();
    this.FileSystemSnapshotForm.controls.intervalMonth.reset();

    this.FileSystemSnapshotForm.controls.dates.clearValidators();
    this.FileSystemSnapshotForm.controls.dates.markAsPristine();
    this.FileSystemSnapshotForm.controls.dates.reset();
    if (value === '0') {
      this.modeType = '0'
    } else if (value === '1') {
      this.modeType = '1'
      this.FileSystemSnapshotForm.controls.daysOfWeek.setValidators([Validators.required]);
      this.FileSystemSnapshotForm.controls.daysOfWeek.markAsDirty();
      this.FileSystemSnapshotForm.controls.daysOfWeek.reset();
    } else if (value === '2') {
      this.modeType = '2'

      this.FileSystemSnapshotForm.controls.dayOfWeek.setValidators([Validators.required]);
      this.FileSystemSnapshotForm.controls.dayOfWeek.markAsDirty();
      this.FileSystemSnapshotForm.controls.dayOfWeek.reset();

      this.FileSystemSnapshotForm.controls.intervalWeek.setValidators([Validators.required]);
      this.FileSystemSnapshotForm.controls.intervalWeek.markAsDirty();
      this.FileSystemSnapshotForm.controls.intervalWeek.reset();
    } else if (value === '3') {
      this.modeType = '3'
      this.FileSystemSnapshotForm.controls.intervalMonth.setValidators([Validators.required, Validators.pattern(/^[1-9]$|^1[0-9]$|^2[0-4]$/)]);
      this.FileSystemSnapshotForm.controls.intervalMonth.markAsDirty();
      this.FileSystemSnapshotForm.controls.intervalMonth.reset();

      this.FileSystemSnapshotForm.controls.dates.setValidators([Validators.required]);
      this.FileSystemSnapshotForm.controls.dates.markAsDirty();
      this.FileSystemSnapshotForm.controls.dates.reset();
    }
  }


  // doGetListVolume() {
  //   this.isLoading = true;
  //   this.volumeList = [];
  //   this.volumeService
  //     .getVolumes(this.userId, this.project, this.region, 1000, 1, null, null)
  //     .subscribe({
  //       next: (next) => {
  //         next.records.forEach((volume) => {
  //           this.volumeList.push({ value: volume.id, label: volume.name });
  //         });
  //         this.isLoading = false;
  //         console.log('list volumes', this.volumeList);
  //       },
  //       error: (e) => {
  //         this.notification.error(
  //           'Có lỗi xảy ra',
  //           'Lấy danh sách Volume thất bại'
  //         );
  //         this.isLoading = false;
  //       },
  //     });
  // }

  constructor(
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private fb: NonNullableFormBuilder,
    // private modalService: NzModalService,
    private fileSystemSnapshotScheduleService: FileSystemSnapshotScheduleService,
    private notification: NzNotificationService,
    private datepipe: DatePipe,
    private projectService: ProjectService
  ) {}

  goBack() {
    this.router.navigate(['/app-smart-cloud/schedule/snapshot/list']);
  }
  request = new CreateScheduleSnapshotDTO();
  // create() {
  //   const modal: NzModalRef = this.modalService.create({
  //     nzTitle: 'Xác nhận tạo lịch Snapshot',
  //     nzContent: `<p>Vui lòng cân nhắc thật kỹ trước khi click nút <b>Đồng ý</b>. Quý khách chắc chắn muốn thực hiện tạo lịch Snapshot?</p>`,
  //     nzFooter: [
  //       {
  //         label: 'Hủy',
  //         type: 'default',
  //         onClick: () => modal.destroy(),
  //       },
  //       {
  //         label: 'Đồng ý',
  //         type: 'primary',
  //         onClick: () => {
  //           this.isLoading = true;
  //           this.request.dayOfWeek = this.dateStart;
  //           this.request.daysOfWeek = [];
  //           this.request.description = this.descSchedule;
  //           this.request.intervalWeek = 1; // fix cứng số tuần  = 1;
  //           this.request.mode = 3; //fix cứng chế độ = theo tuần ;
  //           this.request.dates = 0;
  //           this.request.duration = 0;
  //           this.request.volumeId = this.volumeId;
  //           this.request.runtime = this.time.toISOString();
  //           this.request.intervalMonth = 0;
  //           this.request.maxBaxup = 1; // fix cứng số bản
  //           this.request.snapshotPacketId = 0;
  //           this.request.customerId = this.userId;
  //           this.request.projectId = this.project;
  //           this.request.regionId = this.region;
  //           console.log(this.request);
  //           this.snapshotService.createSnapshotSchedule(this.request).subscribe(
  //             (data) => {
  //               if (data != null) {
  //                 console.log(data);
  //                 this.isLoading = false;
  //                 this.notification.success('Success', 'Tạo lịch thành công');
  //                 this.router.navigate([
  //                   '/app-smart-cloud/schedule/snapshot/list',
  //                 ]);
  //               } else {
  //                 this.notification.error('Có lỗi xảy ra', 'Tạo lịch thất bại');
  //                 this.isLoading = false;
  //               }
  //             },
  //             (error) => {
  //               console.log(error);
  //               this.notification.error('Có lỗi xảy ra', 'Tạo lịch thất bại');
  //               this.isLoading = false;
  //             }
  //           );
  //           modal.destroy();
  //         },
  //       },
  //     ],
  //   });
  // }

  // checkSpecialSnapshotName(str: string): boolean {
  //   //check ký tự đặc biệt
  //   const specialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
  //   return specialCharacters.test(str);
  // }

  // onRegionChange(region: RegionModel) {
  //   this.region = region.regionId;
  // }

  // onProjectChange(project: ProjectModel) {
  //   this.project = project?.id;
  //   this.doGetListVolume();
  // }

  
}
