import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SnapshotVolumeService } from '../../../shared/services/snapshot-volume.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VolumeService } from '../../../shared/services/volume.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { CreateScheduleSnapshotDTO, FormSearchScheduleSnapshot } from '../../../shared/models/snapshotvl.model';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { getCurrentRegionAndProject } from '@shared';
import { FormSearchPackageSnapshot } from 'src/app/shared/models/package-snapshot.model';
import { PackageSnapshotService } from 'src/app/shared/services/package-snapshot.service';
import { DatePipe } from '@angular/common';
import { RegionModel, ProjectModel } from '../../../../../../../libs/common-utils/src';
import { finalize } from 'rxjs';
import { LoadingService } from '@delon/abc/loading';
import { InstancesService } from '../../instances/instances.service';
import { checkPossiblePressNumber } from '../../../shared/utils/common';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { VpcService } from '../../../shared/services/vpc.service';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { RegionID } from 'src/app/shared/enums/common.enum';

@Component({
  selector: 'one-portal-create-schedule-snapshot',
  templateUrl: './snapshot-schedule-create.component.html',
  styleUrls: ['./snapshot-schedule-create.component.less'],
})
export class SnapshotScheduleCreateComponent implements OnInit {
  region: number;
  project: number;
  @Input() snapshotTypeCreate: any = 2; // VM:1 Volume:0 none:2
  navigateTypeSelected: number;
  isLoading: boolean;
  volumeId: number;
  volumeList: NzSelectOptionInterface[] = [];
  userId: number;
  descSchedule: string = '';
  mode: string = 'Hằng ngày'
  snapshotPackageList: NzSelectOptionInterface[] = []
  time: Date = new Date();
  defaultOpenValue = new Date(0, 0, 0, 0, 0, 0);
  quotaHDDTotal: any;
  quotaHDDUsed: any;
  quotaSSDTotal: any;
  quotaSSDUsed: any;
  quotaTotal: any;
  quotaUsed: any;
  quotaRemain: any;
  disableByQuota: boolean;
  quotaType: any;
  selectedVolumeRoot: any;
  loadingCreate: boolean;
  dataVolumeExisted: number[] = [];
  dataVmExisted: number[] = [];

  nameList: string[] = [];
  formSearchScheduleSnapshot: FormSearchScheduleSnapshot = new FormSearchScheduleSnapshot()

  isQuota: boolean;
  isNotEnoughQuota: boolean;
  messageQuota: string;
  messageArchivedVersion: string;
  isMessageArchivedVersion: boolean = false;

  packageSnapshotHdd: number;
  packageSnapshotSsd: number;
  packageUsedHdd: number;
  packageUsedSsd: number;
  availableSizeSSD: number;
  availableSizeHDD: number;

  projectId: number;
  projectName: string;
  projectRemainingHdd: number;
  projectRemainingSsd: number;
  quotaSelected: number = 0;
  quotaTypeSelected: string;
  projectTotalHdd: number;
  projectTotalSsd: number;
  projectUsedHdd: number;
  projectUsedSsd: number;

  instanceId: number;

  request = new CreateScheduleSnapshotDTO();
  projectType: number;
  snapshotPackageLoading: boolean;
  selectedSnapshotPackage: any;
  snapshotPackageArray: any;
  selectedSnapshotType = 0; // 0 vlome 1 vm
  volumeLoading: boolean | string;
  selectedVolume: any;
  vmLoading: boolean | string;
  selectedVM: any;
  volumeArray: any;
  vmArray: any;
  numOfVersion = 1;
  disableCreate = true;
  titleBreadcrumb: string;
  breadcrumbBlockStorage: string;
  namePackage: string;
  idSnapshotPackage: number;
  isQuotaVPC: boolean = false;
  isVisibleCreate: boolean = false;

  isPackageQuota: boolean = false;
  isNotPackageQuota: boolean = false;
  isVPCQuota:boolean = false;
  isNotVPCQuota:boolean = false;

  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  constructor(
    private vpcService: VpcService,
    private router: Router,
    private loadingSrv: LoadingService,
    private activatedRoute: ActivatedRoute,
    private instancesService: InstancesService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private fb: NonNullableFormBuilder,
    private snapshotService: SnapshotVolumeService,
    private volumeService: VolumeService,
    private modalService: NzModalService,
    private notification: NzNotificationService,
    private packageSnapshotService: PackageSnapshotService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private vlService: VolumeService,
    private datepipe: DatePipe,

  ) { }

  //new
  snapShotArray = [
    { label: 'Snapshot Volume', value: 0 },
    { label: 'Snapshot máy ảo', value: 1 }
  ];

  formSearchPackageSnapshot: FormSearchPackageSnapshot = new FormSearchPackageSnapshot()
  validateForm: FormGroup<{
    radio: FormControl<any>
    quota: FormControl<string>
    name: FormControl<string>
    volume: FormControl<number>
    snapshotPackage: FormControl<number>
  }> = this.fb.group({
    radio: ['', []],
    quota: ['0GB', []],
    name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]*$/),
    Validators.maxLength(50), this.duplicateNameValidator.bind(this)]],
    volume: [null as number, []],
    snapshotPackage: [null as number, []]
  })
  url = window.location.pathname;

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
    this.userId = this.tokenService.get()?.userId;
    if (!this.url.includes('advance')) {
      if (Number(localStorage.getItem('regionId')) === RegionID.ADVANCE) {
        this.region = RegionID.NORMAL;

      } else {
        this.region = Number(localStorage.getItem('regionId'));
      }
      this.titleBreadcrumb = 'Dịch vụ hạ tầng'
      this.breadcrumbBlockStorage = 'Block Storage'

    } else {
      this.region = RegionID.ADVANCE;
      this.titleBreadcrumb = 'Dịch vụ nâng cao'
      this.breadcrumbBlockStorage = 'Block Storage nâng cao'
    }
    this.doGetListSnapshotPackage();
    this.loadSnapshotPackage();
    this.packageSnapshotService.getExistedSchedule(this.project)
      .pipe(finalize(() => {
        this.loadVolumeList();
        this.loadVmList();
      }))
      .subscribe(
        data => {
          for (let item of data) {
            console.log("data dataVolumeExisted", data)
            if (item.snapshotType == 0) {
              this.dataVolumeExisted.push(item.serviceInstanceId)
            } else {
              this.dataVmExisted.push(item.serviceInstanceId)
            }
          }
        }
      )
    // this.validateForm.controls['quota'].disable();
    this.getListSchedules();

    const currentDate = new Date();
    console.log("currentDate", currentDate)
  }


  doGetListVolume() {
    this.isLoading = true;
    this.volumeList = [];
    this.volumeService
      .getVolumes(this.userId, this.project, this.region, 1000, 1, null, null)
      .subscribe({
        next: (next) => {
          next.records.forEach((volume) => {
            this.volumeList.push({ value: volume.id, label: volume.name });
          });
          this.isLoading = false;
          console.log('list volumes', this.volumeList);
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            'Lấy danh sách Volume thất bại'
          );
          this.isLoading = false;
        },
      });
  }

  doGetListSnapshotPackage() {
    this.snapshotPackageList = []
    this.formSearchPackageSnapshot.projectId = this.project
    this.formSearchPackageSnapshot.regionId = this.region
    this.formSearchPackageSnapshot.packageName = ''
    this.formSearchPackageSnapshot.pageSize = 100
    this.formSearchPackageSnapshot.currentPage = 1
    this.formSearchPackageSnapshot.status = ''
    this.packageSnapshotService.getPackageSnapshot(this.formSearchPackageSnapshot)
      .subscribe(data => {
        console.log(data);

        data.records.forEach(data => {
          this.snapshotPackageList.push({ label: data.packageName, value: data.id });
        })
      }, error => {
        this.isLoading = false
        this.snapshotPackageList = null
      })
  }
  // call api get list schedule snapshot.
  private getListSchedules() {
    this.formSearchScheduleSnapshot.projectId = this.project
    this.formSearchScheduleSnapshot.regionId = this.region
    this.formSearchScheduleSnapshot.pageSize = 9999
    this.formSearchScheduleSnapshot.pageNumber = 1
    this.formSearchScheduleSnapshot.ssPackageId = ''
    this.snapshotService.getListSchedule(this.formSearchScheduleSnapshot)
      .subscribe(data => {
        data.records.forEach((item) => {
          console.log("item lich", item)
          if (this.nameList.length > 0) {
            this.nameList.push(item.name);
          } else {
            this.nameList = [item.name];
          }
        });
      }, (error) => {
        this.nameList = null;
      })
  }
  duplicateNameValidator(control) {
    const value = control.value;
    // Check if the input name is already in the list
    if (this.nameList && this.nameList.includes(value)) {
      return { duplicateName: true };
    } else {
      return null;
    }
  }


  createModalSchedule() {
    this.isVisibleCreate = true;
  }
  create() {
    console.log("timeebbb", this.time)
    this.isLoading = true;
    this.request.description = this.descSchedule;
    this.request.mode = 1; //fix cứng chế độ = theo tuần ;
    this.request.runtime = this.time

    console.log(" this.request.runtime ",  this.request.runtime )
    this.request.snapshotPacketId = this.projectType == 1 ? null : this.selectedSnapshotPackage?.id;
    this.request.serviceInstanceId = ((this.selectedSnapshotType == 1 && this.snapshotTypeCreate == 2) || this.snapshotTypeCreate == 1) ? this.selectedVM.id : this.selectedVolume.id;
    this.request.maxSnapshot = this.numOfVersion
    this.request.snapshotType = ((this.selectedSnapshotType == 1 && this.snapshotTypeCreate == 2) || this.snapshotTypeCreate == 1) ? 1 : 0;
    this.request.customerId = this.userId;
    this.request.projectId = this.project;
    this.request.regionId = this.region;
    this.snapshotService.createSnapshotSchedule(this.request)
      .pipe(finalize(() => {
        this.isVisibleCreate = false;
      }))
      .subscribe(
        data => {
          console.log(data);
          this.isLoading = false;
          this.notification.success('Thành công', 'Tạo lịch thành công');
          this.navigateToSnapshotSchedule();
        },
        error => {
          this.notification.error(this.i18n.fanyi("app.status.fail"), error.error.message);
          this.isLoading = false;
        }
      );

  }
  handleCancel() {
    this.isVisibleCreate = false
  }

  navigateToSnapshotSchedule() {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/schedule/snapshot-advance']);
    } else {
      this.router.navigate(['/app-smart-cloud/schedule/snapshot']);
    }
  }
  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
    if (this.projectCombobox) {
      this.projectCombobox.loadProjects(true, region.regionId);
    }
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.project = project?.id;
    // this.doGetListVolume();

    this.projectId = project?.id;
    this.projectType = project?.type;
    this.projectName = project?.projectName;
    if (project?.type == 1) {
      this.vpcService.getTotalResouce(project?.id).subscribe(
        data => {
          this.projectTotalHdd = data.cloudProject.quotaVolumeSnapshotHddInGb;
          this.projectTotalSsd = data.cloudProject.quotaVolumeSnapshotSsdInGb;
          this.projectUsedHdd = data.cloudProjectResourceUsed.volumeSnapshotHddInGb;
          this.projectUsedSsd = data.cloudProjectResourceUsed.volumeSnapshotSsdInGb;

          this.projectRemainingHdd = this.projectTotalHdd - this.projectUsedHdd;
          this.projectRemainingSsd = this.projectTotalSsd - this.projectUsedSsd;


        });
    }
  }

  onUserChange(project: ProjectModel) {
    this.navigateToSnapshotSchedule()
  }


  private loadSnapshotPackage() {
    this.formSearchPackageSnapshot.projectId = this.project;
    this.formSearchPackageSnapshot.regionId = this.region;
    this.formSearchPackageSnapshot.packageName = '';
    this.formSearchPackageSnapshot.pageSize = 9999999;
    this.formSearchPackageSnapshot.currentPage = 1;
    this.formSearchPackageSnapshot.status = '';
    this.packageSnapshotService.getPackageSnapshot(this.formSearchPackageSnapshot)
      .pipe(finalize(() => {
        this.snapshotPackageLoading = false;
      }))
      .subscribe(
        data => {
          this.snapshotPackageArray = data.records.filter(item => item.status == 'AVAILABLE');
        }
      );
  }
  // format tên package snapahot
  formatLabel(index: any): string {
    let label = index.packageName;

    if (index.totalSizeHDD > 0 || index.totalSizeSSD > 0) {
      label += ' (';
      if (index.totalSizeHDD > 0) {
        label += `${index.totalSizeHDD} GB HDD`;
      }
      if (index.totalSizeHDD > 0 && index.totalSizeSSD > 0) {
        label += ' - ';
      }
      if (index.totalSizeSSD > 0) {
        label += `${index.totalSizeSSD} GB SSD`;
      }
      label += ')';
    }

    return label;
  }

  changePackageSnapshot() {
    // dự án thường
    if (this.projectType != 1 && this.selectedSnapshotPackage) {

      this.packageSnapshotService.detail(this.selectedSnapshotPackage.id, this.project)
        .pipe(finalize(() => {
          // this.checkDisable();
        }))
        .subscribe(data => {
          this.packageSnapshotHdd = data.totalSizeHDD;
          this.packageSnapshotSsd = data.totalSizeSSD;
          this.packageUsedHdd = data.usedSizeHDD;
          this.packageUsedSsd = data.usedSizeSSD;
          this.availableSizeSSD = data.availableSizeSSD;
          this.availableSizeHDD = data.availableSizeHDD;
          this.namePackage = data.packageName;
          this.idSnapshotPackage = data.id;

          this.isPackageQuota = true;
          this.isNotPackageQuota = true;
          this.isVPCQuota = true;
          this.isNotVPCQuota = true;

        });
    }
    if (this.selectedSnapshotPackage == undefined) {
      this.disableByQuota = false;
      this.disableCreate = true;
    }
  }

  changeTypeSnaphot() {
    this.selectedVolume = undefined;
    this.selectedVM = undefined;
    this.quotaType = undefined;
    // this.isQuota = false;
    this.isPackageQuota = false;
    this.isNotPackageQuota = false;
    this.isVPCQuota = false;
    this.isNotVPCQuota = false;
    console.log(" this.isPackageQuota", this.isPackageQuota)
    console.log(" this.this.isNotPackageQuota", this.isNotPackageQuota)
    console.log(" this.isVPCQuota", this.isVPCQuota)
    console.log(" this.isNotVPCQuota", this.isNotVPCQuota)
  }

  // changeVmVolume() {
  //   // get type
  //   if ((this.selectedVolume != undefined || this.selectedVM != undefined)) {
  //     if (this.snapshotTypeCreate == 0 || (this.selectedSnapshotType == 0 && this.snapshotTypeCreate == 2)) {
  //       this.quotaType = this.selectedVolume.volumeType;
  //       this.checkDisable();
  //     } else {
  //       this.loadingCreate = true;
  //       this.vlService.getVolumeById(this.selectedVM.volumeRootId, this.project)
  //         .pipe(finalize(() => {
  //           this.checkDisable();
  //           this.loadingCreate = false;
  //         }))
  //         .subscribe(
  //           data => {
  //             this.quotaType = data.volumeType;
  //             this.selectedVolumeRoot = data;

  //             this.isPackageQuota = false;
  //             this.isNotPackageQuota = false;
  //             this.isVPCQuota = false;
  //             this.isNotVPCQuota = false;
  //           }
  //         );
  //     }
  //   } else {
  //     this.validateForm.controls['quota'].setValue('0GB');
  //     this.quotaType = '';
  //   }

  //   if (((this.snapshotTypeCreate == 0 || (this.selectedSnapshotType == 0 && this.snapshotTypeCreate == 2)) && this.selectedVolume == undefined) ||
  //     ((this.snapshotTypeCreate == 1 || (this.selectedSnapshotType == 1 && this.snapshotTypeCreate == 2)) && this.selectedVM == undefined)) {
  //     this.disableByQuota = false;
  //     this.disableCreate = true;
  //   }
  // }
  idVolume: number;
  private loadVolumeList() {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.volumeService.getVolumes(this.tokenService.get()?.userId, this.project, this.region, 9999, 1, 'KHOITAO', '')
      .pipe(finalize(() => {
        this.volumeLoading = false;
      }))
      .subscribe(
        data => {
          this.volumeArray = data?.records.filter(item => {
            return ['AVAILABLE', 'IN-USE'].includes(item?.serviceStatus);
          }).filter(item => {
            return !this.dataVolumeExisted.includes(item?.id);
          });
          // check id volume được chọn khi tạo từ ds volume
          this.activatedRoute.queryParams.subscribe(params => {
            this.idVolume = params['volumeId'];
            // let snapshotTypeCreate = params['snapshotTypeCreate'];
            this.navigateTypeSelected = params['snapshotTypeCreate'];
            if (this.idVolume && this.navigateTypeSelected == 0) {
              this.selectedVolume = this.volumeArray?.find(e => e.id == this.idVolume);
              this.changeVmVolumeSelected();

            } else {
              this.selectedVolume = null;
            }
          });
        }
      );
  }

  private loadVmList() {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.instancesService.search(1, 9999, this.region, this.project, '', '', true, this.tokenService.get()?.userId)
      .pipe(finalize(() => {
        this.loadingSrv.close();
        this.vmLoading = false;
      }))
      .subscribe(
        data => {
          this.vmArray = data.records.filter(item => {
            return item.taskState === 'ACTIVE' && item.status === 'KHOITAO'
          }
          ).filter(item => {
            return !this.dataVmExisted.includes(item?.id);
          });
          console.log("this.vmArray 22", this.vmArray)
          // check id máy ảo được chọn khi tạo từ ds máy ảo
          this.activatedRoute.queryParams.subscribe(params => {
            this.instanceId = params['instanceId'];
            console.log("this.instanceId888", this.instanceId)
            this.navigateTypeSelected = params['snapshotTypeCreate'];

            if (this.instanceId && this.navigateTypeSelected == 1) {
              this.selectedVM = this.vmArray?.find(e => e?.id == this.instanceId);
              this.instancesService.getById(this.instanceId, false).subscribe(data => {
                console.log("data vm 00", data)
                let volumeRootId = data.volumeRootId;
                console.log("volumeRootId 00", volumeRootId)
                this.vlService.getVolumeById(volumeRootId, this.project)
                  .pipe(finalize(() => {
                    // this.checkDisable();
                    this.loadingCreate = false;
                  }))
                  .subscribe(
                    data => {
                      this.quotaSelected = data.sizeInGB
                      this.quotaTypeSelected = data.volumeType;
                    })
                this.changeVmVolumeSelected();
              })
            } else {
              this.selectedVM = null;
            }
          });
        }
      );
  }
  checkPossiblePress(event: KeyboardEvent) {
    const key = event.key;
    if (isNaN(Number(key)) && key !== 'Backspace' && key !== 'Delete' && key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'Tab') {
      event.preventDefault();
    }
  }

  private checkDisableByQuota() {
    this.disableByQuota = false;
    if (this.quotaType != undefined && this.quotaSSDTotal != undefined && this.quotaSSDUsed != undefined && this.quotaHDDTotal != undefined && this.quotaHDDUsed != undefined
      && this.validateForm.controls['quota'].value != '0GB') {
      if (this.quotaType == 'ssd') {
        this.quotaTotal = this.quotaSSDTotal;
        this.quotaUsed = this.quotaSSDUsed;
      } else {
        this.quotaTotal = this.quotaHDDTotal;
        this.quotaUsed = this.quotaHDDUsed;
      }
      this.quotaRemain = this.quotaTotal - this.quotaUsed;
      if (this.quotaRemain < this.validateForm.controls['quota'].value.replace('GB', '')) {
        this.disableByQuota = true;
      }
    }
  }

  private checkDisable() {
    this.disableCreate = false;
    if ((this.selectedSnapshotPackage == undefined && this.projectType != 1) ||
      ((this.snapshotTypeCreate == 0 || (this.selectedSnapshotType == 0 && this.snapshotTypeCreate == 2)) && this.selectedVolume == undefined) ||
      ((this.snapshotTypeCreate == 1 || (this.selectedSnapshotType == 1 && this.snapshotTypeCreate == 2)) && this.selectedVM == undefined)) {
      this.disableCreate = true;
    }

    if ((this.snapshotTypeCreate == 0 || (this.selectedSnapshotType == 0 && this.snapshotTypeCreate == 2)) && this.selectedVolume != undefined) {
      this.validateForm.controls['quota'].setValue(this.selectedVolume?.sizeInGB == undefined ? '0GB' : this.selectedVolume?.sizeInGB + 'GB');
    } else if ((this.snapshotTypeCreate == 1 || (this.selectedSnapshotType == 1 && this.snapshotTypeCreate == 2)) && this.selectedVolumeRoot != undefined) {
      this.validateForm.controls['quota'].setValue(this.selectedVolumeRoot?.sizeInGB == undefined ? '0GB' : this.selectedVolumeRoot?.sizeInGB + 'GB');
    } else {
      this.validateForm.controls['quota'].setValue('0GB');
    }
    this.checkDisableByQuota();
  }

  // change VM/Volume 

  changeVmVolumeSelected() {
   
    if (this.selectedSnapshotType == 0 || this.navigateTypeSelected == 0) {
      this.vlService.getVolumeById(this.selectedVolume.id, this.project)
        .pipe(finalize(() => {
          // this.checkDisable();
          this.loadingCreate = false;
        }))
        .subscribe(
          data => {
            console.log("change volume", data)
            this.quotaSelected = data.sizeInGB
            this.quotaTypeSelected = data.volumeType;
            this.selectedVolumeRoot = data;
            this.isPackageQuota = true;
            this.isNotPackageQuota = true;
            this.isVPCQuota = true;
            this.isNotVPCQuota = true;
            
          }
        );
    }
    else if (this.selectedSnapshotType == 1 || this.navigateTypeSelected == 1) {
      this.vlService.getVolumeById(this.selectedVM.volumeRootId, this.project)
        .pipe(finalize(() => {
          // this.checkDisable();
          this.loadingCreate = false;
        }))
        .subscribe(
          data => {
            console.log("kkk")
            console.log("change vm", data)
            this.quotaSelected = data.sizeInGB
            this.quotaTypeSelected = data.volumeType;
            this.selectedVolumeRoot = data;

            this.isPackageQuota = true;
            this.isNotPackageQuota = true;
            this.isVPCQuota = true;
            this.isNotVPCQuota = true;
           
          }
        );
    }
  }

  // changeNumberVersion(value: number) {
  //   // this.getInterruptionDay();
  //   console.log("valuoo", value)
  //   if (this.projectType != 1) {
  //     if (this.selectedSnapshotType == 0 || this.navigateTypeSelected == 0) {
  //       if (this.selectedSnapshotPackage) {
  //         // if (this.quotaTypeSelected == 'hdd') {
  //         if ((this.packageSnapshotHdd < (this.quotaSelected * this.numOfVersion) && this.quotaTypeSelected == 'hdd') || (this.packageSnapshotSsd < (this.quotaSelected * this.numOfVersion) && this.quotaTypeSelected == 'ssd')) {
  //           const ngayGianDoan = this.getInterruptionDay(this.packageSnapshotHdd, this.quotaSelected, this.numOfVersion);
  //           const time: any = this.convertDate(ngayGianDoan.toLocaleString())
  //           this.isQuota = false;
  //           this.isQuotaVPC = false;
  //           this.isNotEnoughQuota = false;
  //           this.isMessageArchivedVersion = true;
  //           this.messageArchivedVersion = `Bản Snapshot ngày  ${time} không thể thực hiện do quý khách đã dùng hết dung lượng gói Snapshot, vui lòng chon gói Snapshot có dung lượng còn lại lớn hơn để quá trình không bị gián đoạn`;
  //         }
  //         else if ((this.availableSizeHDD >= this.quotaSelected && this.quotaTypeSelected == 'hdd') || (this.availableSizeSSD >= this.quotaSelected && this.quotaTypeSelected == 'ssd')) {
  //           this.isQuota = true;
  //           this.isQuotaVPC = false;
  //           this.isNotEnoughQuota = false;
  //           this.isMessageArchivedVersion = false;
  //           this.messageArchivedVersion = '';

  //         }
  //         else {
  //           this.isQuota = false;
  //           this.isQuotaVPC = false;
  //           this.isNotEnoughQuota = true;
  //           this.isMessageArchivedVersion = false;
  //           this.messageQuota = '';
  //           this.messageArchivedVersion = '';
  //         }

  //       }
  //       else {
  //         this.isQuota = false;
  //         this.isQuotaVPC = false;
  //         this.isNotEnoughQuota = false;
  //         this.isMessageArchivedVersion = false;
  //       }

  //     }
  //     // check thông báo với máy ảo
  //     else if (this.selectedSnapshotType == 1 || this.navigateTypeSelected == 1) {
  //       if (this.selectedSnapshotPackage) {

  //         if ((this.packageSnapshotHdd < (this.quotaSelected * this.numOfVersion) && this.quotaTypeSelected == 'hdd') || (this.packageSnapshotSsd < (this.quotaSelected * this.numOfVersion) && this.quotaTypeSelected == 'ssd')) {
  //           const ngayGianDoan = this.getInterruptionDay(this.packageSnapshotHdd, this.quotaSelected, this.numOfVersion);
  //           const time: any = this.convertDate(ngayGianDoan.toLocaleString())
  //           this.isQuota = false;
  //           this.isQuotaVPC = false;
  //           this.isNotEnoughQuota = false;
  //           this.isMessageArchivedVersion = true;
  //           this.messageArchivedVersion = `Bản Snapshot ngày  ${time} không thể thực hiện do quý khách đã dùng hết dung lượng gói Snapshot, vui lòng chon gói Snapshot có dung lượng còn lại lớn hơn để quá trình không bị gián đoạn`;
  //         }
  //         else if ((this.availableSizeHDD >= this.quotaSelected && this.quotaTypeSelected == 'hdd') || (this.availableSizeSSD >= this.quotaSelected && this.quotaTypeSelected == 'ssd')) {
  //           this.isQuota = true;
  //           this.isQuotaVPC = false;
  //           this.isNotEnoughQuota = false;
  //           this.isMessageArchivedVersion = false;
  //           this.messageArchivedVersion = '';

  //         }
  //         else {
  //           this.isQuota = false;
  //           this.isQuotaVPC = false;
  //           this.isNotEnoughQuota = true;
  //           this.isMessageArchivedVersion = false;
  //           this.messageQuota = '';
  //           this.messageArchivedVersion = '';
  //         }

  //       }
  //       else {
  //         this.isQuota = false;
  //         this.isQuotaVPC = false;
  //         this.isNotEnoughQuota = false;
  //         this.isMessageArchivedVersion = false;
  //       }
  //     }

  //   }
  //   // dự án vpc tuỳ biến
  //   else if (this.projectType == 1) {
  //     // máy ảo
  //     if (this.selectedSnapshotType == 1 || this.navigateTypeSelected == 1) {
  //       if ((this.projectRemainingHdd < (this.quotaSelected * this.numOfVersion) && this.quotaTypeSelected == 'hdd') || (this.projectRemainingSsd < (this.quotaSelected * this.numOfVersion) && this.quotaTypeSelected == 'ssd')) {
  //         const ngayGianDoan = this.getInterruptionDay(this.projectRemainingHdd, this.quotaSelected, this.numOfVersion);
  //         const time: any = this.convertDate(ngayGianDoan.toLocaleString())
  //         this.isQuota = false;
  //         this.isQuotaVPC = false;
  //         this.isNotEnoughQuota = false;
  //         this.isMessageArchivedVersion = true;
  //         this.messageArchivedVersion = `Bản Snapshot ngày ${time} không thể thực hiện do quý khách đã dùng hết dung lượng gói Snapshot, vui lòng chon gói Snapshot có dung lượng còn lại lớn hơn để quá trình không bị gián đoạn`;
  //       }
  //       else if ((this.projectRemainingHdd >= this.quotaSelected && this.quotaTypeSelected == 'hdd') || (this.projectRemainingSsd >= this.quotaSelected && this.quotaTypeSelected == 'ssd')) {
  //         this.isQuotaVPC = true
  //         this.isQuota = false;
  //         this.isNotEnoughQuota = false;
  //         this.isMessageArchivedVersion = false;
  //       }
  //       else {
  //         this.isQuota = false;
  //         this.isQuotaVPC = false;
  //         this.isNotEnoughQuota = true;
  //         this.isMessageArchivedVersion = false;
  //         this.messageQuota = '';
  //         this.messageArchivedVersion = '';
  //       }

  //     }
  //     // volume
  //     else if (this.selectedSnapshotType == 0 || this.navigateTypeSelected == 0) {
  //       if ((this.projectRemainingHdd < (this.quotaSelected * this.numOfVersion) && this.quotaTypeSelected == 'hdd') || (this.projectRemainingSsd < (this.quotaSelected * this.numOfVersion) && this.quotaTypeSelected == 'ssd')) {
  //         const ngayGianDoan = this.getInterruptionDay(this.projectRemainingHdd, this.quotaSelected, this.numOfVersion);
  //         const time: any = this.convertDate(ngayGianDoan.toLocaleString())
  //         this.isQuota = false;
  //         this.isQuotaVPC = false;
  //         this.isNotEnoughQuota = false;
  //         this.isMessageArchivedVersion = true;
  //         this.messageArchivedVersion = `Bản Snapshot ngày ${time} không thể thực hiện do quý khách đã dùng hết dung lượng gói Snapshot, vui lòng chon gói Snapshot có dung lượng còn lại lớn hơn để quá trình không bị gián đoạn`;
  //       }
  //       else if ((this.projectRemainingHdd >= this.quotaSelected && this.quotaTypeSelected == 'hdd') || (this.projectRemainingSsd >= this.quotaSelected && this.quotaTypeSelected == 'ssd')) {
  //         this.isQuotaVPC = true
  //         this.isQuota = false;
  //         this.isNotEnoughQuota = false;
  //         this.isMessageArchivedVersion = false;
  //       }
  //       else {
  //         this.isQuota = false;
  //         this.isQuotaVPC = false;
  //         this.isNotEnoughQuota = true;
  //         this.isMessageArchivedVersion = false;
  //         this.messageQuota = '';
  //         this.messageArchivedVersion = '';
  //       }

  //     }
  //     else {
  //       this.isQuota = false;
  //       this.isQuotaVPC = false;
  //       this.isNotEnoughQuota = false;
  //       this.isMessageArchivedVersion = false;
  //     }

  //   }

  // }

  // getInterruptionDay(D_package: number, D_quotaSelected: number, numberVersion: number): Date {
  //   // Lấy giờ và phút từ đối tượng Date
  //   const gioChon = this.time.getHours();
  //   const phutChon = this.time.getMinutes();
  //   // const thoiGianChon = new Date();
  //   const thoiGianChon =this.time;
  //   console.log("gioChon",gioChon)
  //   console.log("phutChon",phutChon)
  //   console.log("thoiGianChon",thoiGianChon)
  //   thoiGianChon.setHours(gioChon, phutChon, 0, 0);

  //   const currentTime = new Date(); // Thời gian hiện tại

  //   // Tính số ngày tối đa có thể lưu trữ
  //   const soNgayLuuTru = Math.floor(D_package / D_quotaSelected);

  //   let ngayBatDau: Date;

  //   // Xác định ngày bắt đầu lưu trữ dựa trên thời gian chọn
  //   if (thoiGianChon >= currentTime) {
  //     // Nếu thời gian chọn lớn hơn hoặc bằng thời gian hiện tại
  //     ngayBatDau = new Date(currentTime); // Bắt đầu từ ngày hiện tại
  //     console.log("ngày bắt đầu hôm nay", ngayBatDau)
  //   } else {
  //     // Nếu thời gian chọn nhỏ hơn thời gian hiện tại
  //     ngayBatDau = new Date(currentTime);
  //     ngayBatDau.setDate(currentTime.getDate() + 1); // Bắt đầu từ ngày kế tiếp
  //     console.log("ngày bắt đầu ngày mai", ngayBatDau)
  //   }

  //   // Tính ngày gián đoạn
  //   const ngayGianDoan = new Date(ngayBatDau);
  //   ngayGianDoan.setDate(ngayBatDau.getDate() + soNgayLuuTru); // Cộng số ngày lưu trữ
  //   ngayGianDoan.setHours(gioChon, phutChon, 0, 0); // Thời gian gián đoạn

  //   return ngayGianDoan;
  // }
  getInterruptionDay(D_package: number, D_quotaSelected: number): number {
   // Tính số bản ghi tối đa có thể tạo
    const maxRecords = Math.floor(D_package / D_quotaSelected);
    return maxRecords;
    
  }

  convertDate(inputDate: string): string {

    const date = new Date(inputDate);

    // Đảm bảo đối tượng Date hợp lệ
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }

    // Định dạng ngày theo dd/mm/yyyy
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
    const year = date.getFullYear();

    // Trả về định dạng ngày
    return `${day}/${month}/${year}`;
  }
  changeTimeNotification(time: any) {
    console.log("timeeeee", time)
    // this.changeNumberVersion(this.numOfVersion)
  }

  // navigateToBreadcrumb
  navigateToBreadcrumb() {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/schedule/snapshot-advance']);
    } else {
      this.router.navigate(['/app-smart-cloud/schedule/snapshot']);
    }
  }
  // navigate form điều chỉnh gói snapshot 
  navigateToPackageDetail(id: number) {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/snapshot-advance/packages/edit/' + id]);
    } else {
      this.router.navigate(['/app-smart-cloud/snapshot/packages/edit/' + id]);
    }
  }
  // navigate form tạo gói snapshot 
  navigateToCreatePackage() {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate([`/app-smart-cloud/snapshot-advance/packages/create`])
    } else {
      this.router.navigate([`/app-smart-cloud/snapshot/packages/create`])
    }
  }
  navigateToPackageUpdate(id: number) {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate([`/app-smart-cloud/snapshot/packages/edit/` + id])
    } else {
      this.router.navigate([`/app-smart-cloud/snapshot/packages/edit/` + id])
    }
  }

}
