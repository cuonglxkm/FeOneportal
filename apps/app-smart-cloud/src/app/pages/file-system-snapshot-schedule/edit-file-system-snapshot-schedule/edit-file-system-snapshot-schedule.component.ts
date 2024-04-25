import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { getCurrentRegionAndProject } from '@shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { FileSystemModel, FormSearchFileSystem } from 'src/app/shared/models/file-system.model';
import { FileSystemSnapshotScheduleDetail, FormEditFileSystemSsSchedule } from 'src/app/shared/models/filesystem-snapshot-schedule';
import { FileSystemSnapshotScheduleService } from 'src/app/shared/services/file-system-snapshot-schedule.service';
import { FileSystemService } from 'src/app/shared/services/file-system.service';
import { BaseResponse, ProjectModel, ProjectService, RegionModel } from '../../../../../../../libs/common-utils/src';

interface SelectedFileSystem {
  id: number;
  name: string;
}
@Component({
  selector: 'one-portal-extend-file-system-snapshot-schedule',
  templateUrl: './edit-file-system-snapshot-schedule.component.html',
  styleUrls: ['./edit-file-system-snapshot-schedule.component.less'],
})
export class EditFileSystemSnapshotScheduleComponent implements OnInit{

  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean = false;
  customerId: number;
  time: Date = new Date();
  modeType: string = '0';
  listOfSelectedDate: string[] = [];
  value: string;
  pageSize: number = 100;
  pageIndex: number = 1;
  response: BaseResponse<FileSystemModel[]>;
  selectedFileSystemName: SelectedFileSystem[];

  formEditFileSystemSsSchedule: FormEditFileSystemSsSchedule =new FormEditFileSystemSsSchedule();
  fileSystemSnapshotScheduleDetail: FileSystemSnapshotScheduleDetail = new FileSystemSnapshotScheduleDetail();

  dateOptions: NzSelectOptionInterface[] = [
    { label: 'Hằng ngày', value: '1' },
    { label: 'Theo thứ', value: '2' },
    { label: 'Theo tuần', value: '3' },
    { label: 'Theo tháng', value: '4' },
  ];

  daysOfWeek = [
    { label: 'Thứ 2', value: '1' },
    { label: 'Thứ 3', value: '2' },
    { label: 'Thứ 4', value: '3' },
    { label: 'Thứ 5', value: '4' },
    { label: 'Thứ 6', value: '5' },
    { label: 'Thứ 7', value: '6' },
    { label: 'Chủ nhật', value: '7' },
  ];
  numberOfWeek = [
    { label: '1 Tuần', value: 1 },
    { label: '2 Tuần', value: 2 },
    { label: '3 Tuần', value: 3 },
  ];

  FileSystemSnapshotForm: FormGroup<{
    name: FormControl<string>;
    listOfFileSystem: FormControl<number[]>;
    runtime: FormControl<Date>;
    mode: FormControl<string>;
    dayOfWeek: FormControl<string>;
    daysOfWeek: FormControl<string[]>;
    intervalWeek: FormControl<number>;
    intervalMonth: FormControl<number>;
    maxSnapshot: FormControl<number>;
    description: FormControl<string>;
    dates: FormControl<string>;
  }> = this.fb.group({
    name: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9][a-zA-Z0-9-_ ]{0,254}$/),
      ],
    ],
    listOfFileSystem: [[] as number[], Validators.required],
    runtime: [new Date(), Validators.required],
    mode: [this.dateOptions[0].value as string, Validators.required],
    dayOfWeek: ['' as string, [Validators.required]],
    daysOfWeek: [[] as string[], Validators.required],
    intervalWeek: [0 as number, Validators.required],
    intervalMonth: [
      0 as number,
      [Validators.required, Validators.pattern(/^[1-9]$|^1[0-9]$|^2[0-4]$/)],
    ],
    maxSnapshot: [1 as number, [Validators.required, Validators.min(1)]],
    description: ['', [Validators.maxLength(700)]],
    dates: ['1' as string, [Validators.required]],
  });

  // updateSelectedFileSystems(selectedFileSystems: number[]): void {
  //   if (this.response && this.response.records) {
  //     this.selectedFileSystemName = [];
  //     selectedFileSystems.forEach((selectedId) => {
  //       const selectedOption = this.response.records.find(
  //         (option) => option.id === selectedId
  //       );
  //       if (selectedOption) {
  //         this.selectedFileSystemName.push({
  //           id: selectedOption.id,
  //           name: selectedOption.name
  //         });
  //       }
  //     });
  //   }
  // }

  snapshotMode = this.dateOptions[0].value;
  isNotSelectedDate(value: string): boolean {
    return this.listOfSelectedDate.indexOf(value) === -1;
  }

  getDayLabelMulti(selectedValue: string): string {
    const selectedDay = this.daysOfWeek.find(
      (day) => day.value === selectedValue
    );
    return selectedDay ? selectedDay.label : '';
  }
  getDayLabel(selectedValue: string): string {
    const selectedDay = this.daysOfWeek.find(
      (day) => day.value === selectedValue
    );
    return selectedDay ? selectedDay.label : '';
  }


  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.getListFileSystem();
    this.getScheduleById(this.activatedRoute.snapshot.paramMap.get('id'))

  }

  regionChange(region: RegionModel) {
    this.region = region.regionId;
    this.projectService.getByRegion(this.region).subscribe((data) => {
      if (data.length) {
        localStorage.setItem('projectId', data[0].id.toString());
        this.router.navigate([
          '/app-smart-cloud/file-system-snapshot-schedule/create',
        ]);
      }
    });
  }

  projectChange(project: ProjectModel) {
    this.project = project?.id;
  }


  getScheduleById(id) {
    this.isLoading = true;
    this.fileSystemSnapshotScheduleService
      .detail(id)
      .subscribe(
        (data) => {
          this.fileSystemSnapshotScheduleDetail = data;
          console.log(data);
          const shareIds = data.items.map((item) => {
            return item
          })

          this.FileSystemSnapshotForm.controls.name.setValue(data.name);
          this.FileSystemSnapshotForm.controls.listOfFileSystem.setValue(shareIds);
          this.FileSystemSnapshotForm.controls.runtime.setValue(new Date(data.runtime));
          this.FileSystemSnapshotForm.controls.mode.setValue(data.mode.toString());
          this.FileSystemSnapshotForm.controls.daysOfWeek.setValue(data.daysOfWeek ? data.daysOfWeek.split(',') : [""]);
          this.FileSystemSnapshotForm.controls.maxSnapshot.setValue(data.maxSnapshot);
          this.FileSystemSnapshotForm.controls.description.setValue(data.description);
          this.FileSystemSnapshotForm.controls.intervalMonth.setValue(data.mode === 4 ? data.interval : 0);
          this.FileSystemSnapshotForm.controls.dates.setValue(data.dates.toString());
          this.FileSystemSnapshotForm.controls.intervalWeek.setValue(data.mode === 3 ? data.interval : 0);
          this.FileSystemSnapshotForm.controls.dayOfWeek.setValue(data.daysOfWeek ? data.daysOfWeek : "");

          this.snapshotMode = data.mode.toString()
          this.isLoading = false;
        },
        (error) => {
          this.fileSystemSnapshotScheduleDetail = null;
          this.isLoading = false;
        }
      );
  }



  getListFileSystem() {
    this.isLoading = true;
    let formSearch = new FormSearchFileSystem();
    formSearch.vpcId = this.project;
    formSearch.regionId = this.region;
    formSearch.name = this.value;
    formSearch.isCheckState = false;
    formSearch.pageSize = this.pageSize;
    formSearch.currentPage = this.pageIndex;
    this.fileSystemService
      .search(formSearch)
      .subscribe(
        (data) => {
          this.isLoading = false;
          console.log(data);

          this.response = data;
        },
        (error) => {
          this.isLoading = false;
          this.response = null;
        }
      );
  }

  getData(): any {
    this.formEditFileSystemSsSchedule.scheduleId = parseInt(this.activatedRoute.snapshot.paramMap.get('id'))
    this.formEditFileSystemSsSchedule.customerId =
      this.tokenService.get()?.userId;
    this.formEditFileSystemSsSchedule.regionId = this.region;
    this.formEditFileSystemSsSchedule.projectId = this.project;
    this.formEditFileSystemSsSchedule.name =
      this.FileSystemSnapshotForm.controls.name.value;
    this.formEditFileSystemSsSchedule.description =
      this.FileSystemSnapshotForm.controls.description.value;
    this.formEditFileSystemSsSchedule.mode = parseInt(
      this.FileSystemSnapshotForm.controls.mode.value
    );
    this.formEditFileSystemSsSchedule.dayOfWeek =
      this.FileSystemSnapshotForm.controls.dayOfWeek.value;
    this.formEditFileSystemSsSchedule.daysOfWeek =
      this.FileSystemSnapshotForm.controls.daysOfWeek.value;
    this.formEditFileSystemSsSchedule.description =
      this.FileSystemSnapshotForm.controls.description.value;
    this.formEditFileSystemSsSchedule.intervalWeek =
      this.FileSystemSnapshotForm.controls.intervalWeek.value;
    this.formEditFileSystemSsSchedule.dates =
      this.FileSystemSnapshotForm.controls.dates.value.toString();
    this.formEditFileSystemSsSchedule.duration = 1;
    this.formEditFileSystemSsSchedule.runtime =
      this.FileSystemSnapshotForm.controls.runtime.value;
    this.formEditFileSystemSsSchedule.intervalMonth =
      this.FileSystemSnapshotForm.controls.intervalMonth.value;
    this.formEditFileSystemSsSchedule.maxSnapshot =
      this.FileSystemSnapshotForm.controls.maxSnapshot.value;
    this.formEditFileSystemSsSchedule.shareIds = this.FileSystemSnapshotForm.controls.listOfFileSystem.value;

    return this.formEditFileSystemSsSchedule;
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
    if (value === '1') {
      this.modeType = '1';
    } else if (value === '2') {
      this.modeType = '2';
      this.FileSystemSnapshotForm.controls.daysOfWeek.setValidators([
        Validators.required,
      ]);
      this.FileSystemSnapshotForm.controls.daysOfWeek.markAsDirty();
      this.FileSystemSnapshotForm.controls.daysOfWeek.reset();
    } else if (value === '3') {
      this.modeType = '3';

      this.FileSystemSnapshotForm.controls.dayOfWeek.setValidators([
        Validators.required,
      ]);
      this.FileSystemSnapshotForm.controls.dayOfWeek.markAsDirty();
      this.FileSystemSnapshotForm.controls.dayOfWeek.reset();

      this.FileSystemSnapshotForm.controls.intervalWeek.setValidators([
        Validators.required,
      ]);
      this.FileSystemSnapshotForm.controls.intervalWeek.markAsDirty();
      this.FileSystemSnapshotForm.controls.intervalWeek.reset();
    } else if (value === '4') {
      this.modeType = '4';
      this.FileSystemSnapshotForm.controls.intervalMonth.setValidators([
        Validators.required,
        Validators.pattern(/^[1-9]$|^1[0-9]$|^2[0-4]$/),
      ]);
      this.FileSystemSnapshotForm.controls.intervalMonth.markAsDirty();
      this.FileSystemSnapshotForm.controls.intervalMonth.reset();

      this.FileSystemSnapshotForm.controls.dates.setValidators([
        Validators.required,
      ]);
      this.FileSystemSnapshotForm.controls.dates.markAsDirty();
      this.FileSystemSnapshotForm.controls.dates.reset();
    }
  }


  constructor(
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private fb: NonNullableFormBuilder,
    private fileSystemSnapshotScheduleService: FileSystemSnapshotScheduleService,
    private notification: NzNotificationService,
    private datepipe: DatePipe,
    private projectService: ProjectService,
    private fileSystemService: FileSystemService,
    private activatedRoute: ActivatedRoute
  ) {
    this.FileSystemSnapshotForm.get('daysOfWeek').valueChanges.subscribe((selectedDays: string[]) => {
      this.listOfSelectedDate = selectedDays;
    });
    this.FileSystemSnapshotForm.get('listOfFileSystem').valueChanges.subscribe((selectedFS: number[]) => {
      if (this.response && this.response.records) {
        this.selectedFileSystemName = selectedFS.map(selectedId => {
          const selectedOption = this.response.records.find(option => option.id === selectedId);
          if (selectedOption) {
            return { id: selectedOption.id, name: selectedOption.name };
          } else {
            return null;
          }
        }).filter(selectedFileSystem => selectedFileSystem !== null);
      }
    });
  }

  handleEdit() {
    this.isLoading = true;
    if (this.FileSystemSnapshotForm.valid) {
      this.formEditFileSystemSsSchedule = this.getData();
      console.log(this.formEditFileSystemSsSchedule);
      this.formEditFileSystemSsSchedule.runtime = this.datepipe.transform(
        this.FileSystemSnapshotForm.controls.runtime.value,
        'yyyy-MM-ddTHH:mm:ss',
        'vi-VI'
      );

      this.fileSystemSnapshotScheduleService
        .edit(this.formEditFileSystemSsSchedule)
        .subscribe(
          (data) => {
            this.isLoading = false

            this.notification.success(
              'Thành công',
              'Chỉnh sửa lịch file system thành công'
            );
            this.router.navigate(['/app-smart-cloud/file-system-snapshot-schedule/list']);
          },
          (error) => {
            this.isLoading = false

            this.notification.error(
              'Thất bại',
              'Chỉnh sửa lịch file system thất bại'
            );
            console.log(error);
          }
        );
    }
  }



}
