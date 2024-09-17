import { Component, Inject, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { VolumeService } from '../../../shared/services/volume.service';
import { InstancesService } from '../../instances/instances.service';
import { PackageSnapshotService } from '../../../shared/services/package-snapshot.service';
import { FormSearchPackageSnapshot } from '../../../shared/models/package-snapshot.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { finalize } from 'rxjs';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { LoadingService } from '@delon/abc/loading';
import { VpcService } from '../../../shared/services/vpc.service';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { RegionID } from 'src/app/shared/enums/common.enum';

@Component({
  selector: 'one-portal-snapshot-create',
  templateUrl: './snapshot-create.component.html',
  styleUrls: ['./snapshot-create.component.less']
})
export class SnapshotCreateComponent implements OnInit, OnChanges {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));
  orderItem: any;

  validateForm: FormGroup<{
    name: FormControl<string>
    description: FormControl<string>
    quota: FormControl<string>
  }> = this.fb.group({
    name: ['', [Validators.required,
    Validators.pattern(/^[a-zA-Z0-9_]*$/),
    Validators.maxLength(50), this.duplicateNameValidator.bind(this)]],
    description: ['', Validators.maxLength(255)],
    quota: ['0 GB', []]
  });
  // quota:number=0;
  snapShotArray = [
    { label: 'Snapshot volume', value: 0 },
    { label: 'Snapshot máy ảo', value: 1 }
  ];
  vmArray: any;
  volumeArray = [];
  snapshotPackageArray: any;
  vmLoading = true;
  volumeLoading = true;
  snapshotPackageLoading = true;
  selectedSnapshotType = 0;
  packageSnapshotHdd: number;
  packageSnapshotSsd: number;
  packageUsedHdd: number;
  packageUsedSsd: number;
  availableSizeSSD: number;
  availableSizeHDD: number;

  selectedVolume: any;
  selectedVM: any;
  selectedSnapshotPackage: any;
  projectType = 0;
  projectName: string;
  projectId: number;
  projectRemainingHdd: number;
  projectRemainingSsd: number;
  quotaSelected: number = 0;
  quotaTypeSelected: string;
  projectTotalHdd: number;
  projectTotalSsd: number;
  projectUsedHdd: number;
  projectUsedSsd: number;

  @Input() navigateType: any = 2; // navigate form(VM:1 Volume:0 none:2)
  navigateTypeSelected: number;
  idVolume: number;
  instanceId: number;

  loadingCreate: boolean;
  disableByQuota = false;

  nameList: string[] = [];

  quotaType: any;
  quotaHDDTotal: any;
  quotaHDDUsed: any;
  quotaSSDTotal: any;
  quotaSSDUsed: any;
  quotaTotal: any;
  quotaUsed: any;
  quotaRemain: any;
  selectedVolumeRoot: any;
  isNotEnoughQuota: boolean = false;
  isQuota: boolean = false;
  namePackage: string;
  packageType: string;
  idSnapshotPackage: number;
  packageTotalHdd: number;
  packageTotalSsd: number;

  titleBreadcrumb: string;
  breadcrumbBlockStorage: string;
  isQuotaVPC: boolean = false;
  isNotPackageQuota: boolean = false;
  isPackageQuota: boolean = false;
  isVPCQuota: boolean = false;
  isNotVPCQuota: boolean = false;

  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;

  constructor(private router: Router,
    private packageSnapshotService: PackageSnapshotService,
    private volumeService: VolumeService,
    private vpcService: VpcService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private notification: NzNotificationService,
    private instancesService: InstancesService,
    private activatedRoute: ActivatedRoute,
    private loadingSrv: LoadingService,
    private vlService: VolumeService,

    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private fb: NonNullableFormBuilder) {
  }
  url = window.location.pathname;
  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
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
    this.loadSnapshotPackage();
    this.loadVolumeList();
    this.loadVmList();
    this.validateForm.controls['quota'].disable();
    this.getListSnapshot()
  }
  // validate name khi nhap trung
  duplicateNameValidator(control) {
    const value = control.value;
    // Check if the input name is already in the list
    if (this.nameList && this.nameList.includes(value)) {
      return { duplicateName: true };
    } else {
      return null;
    }
  }
  // call api get list snapshot check validate name
  getListSnapshot() {
    this.vlService.serchSnapshot(99999, 1, this.region, this.project, '', '', '')
      .pipe(finalize(() => { }))
      .subscribe(
        data => {
          data.records.forEach((item) => {
            if (this.nameList.length > 0) {
              this.nameList.push(item.name);
            } else {
              this.nameList = [item.name];
            }
          });
        }, (error) => {
          this.nameList = null;
        }
      );
  }


  regionChanged(region: RegionModel) {
    if (this.projectCombobox) {
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.region = region.regionId;
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    console.log("project123", project)
    this.project = project?.id;
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
          this.projectRemainingSsd = this.projectTotalSsd - this.projectUsedSsd

        });
    }

  }

  navigateToCreateVolume() {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate([`/app-smart-cloud/volumes-advance/create`])
    } else {
      this.router.navigate([`/app-smart-cloud/volumes/create`])
    }
  }
  navigateToCreatePackage() {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate([`/app-smart-cloud/snapshot-advance/packages/create`])
    } else {
      this.router.navigate([`/app-smart-cloud/snapshot/packages/create`])
    }
  }

  navigateToPaymentSummary() {
    this.loadingCreate = true;
    const data = {
      name: this.validateForm.controls['name'].value,
      description: this.validateForm.controls['description'].value,
      volumeId: this.navigateType == 0 || (this.selectedSnapshotType == 0 && this.navigateType == 2) ? this.selectedVolume.id : null,
      vmId: this.navigateType == 1 || (this.selectedSnapshotType == 1 && this.navigateType == 2) ? this.selectedVM.id : null,
      region: this.region,
      projectId: this.project,
      scheduleId: null,
      forceCreate: true,
      snapshotPackageId: this.selectedSnapshotPackage?.id
    };
    this.volumeService.createSnapshot(data)
      .pipe(finalize(() => {
        this.loadingCreate = false;
      }))
      .subscribe(
        data => {
          this.notification.success(this.i18n.fanyi('app.status.success'), 'Tạo thành công');
          this.navigateToSnapshot()
        },
        error => {
          this.notification.error(this.i18n.fanyi('app.status.fail'), error.error.message);
        }
      );
  }

  navigateToSnapshot() {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/snapshot-advance'])
    } else {
      this.router.navigate(['/app-smart-cloud/snapshot'])
    }
  }

  userChanged($event: any) {
    //navigate list
    this.navigateToSnapshot()
  }

  formSearchPackageSnapshot: FormSearchPackageSnapshot = new FormSearchPackageSnapshot();
  disableCreate = true;
  // quota: string = '0 GB';

  // load ds package snapshot đang hoạt động
  private loadSnapshotPackage() {
    this.formSearchPackageSnapshot.projectId = this.project;
    this.formSearchPackageSnapshot.regionId = this.region;
    this.formSearchPackageSnapshot.packageName = '';
    this.formSearchPackageSnapshot.pageSize = 99999;
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


  // load ds volume
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
          });

          // check id volume được chọn khi tạo từ ds volume
          this.activatedRoute.queryParams.subscribe(params => {
            this.idVolume = params['volumeId'];
            let navigateType = params['navigateType'];
            if (this.idVolume && navigateType == 0) {
              this.selectedSnapshotType == 0
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

          this.vmArray = data.records.filter(item =>
            item.taskState === 'ACTIVE' && item.status === 'KHOITAO'
          );
          console.log("this.vmArray 22", this.vmArray)
          // check id máy ảo được chọn khi tạo từ ds máy ảo
          this.activatedRoute.queryParams.subscribe(params => {
            this.instanceId = params['instanceId'];
            this.navigateTypeSelected = params['navigateType'];

            if (this.instanceId && this.navigateTypeSelected == 1) {
              this.selectedVM = this.vmArray?.find(e => e?.id == this.instanceId);
              this.instancesService.getById(this.instanceId, false).subscribe(data => {
                let volumeRootId = data.volumeRootId;
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.snapshotTypeCreate && changes.snapshotTypeCreate.previousValue == undefined) {
      if (this.navigateType != undefined) {
        this.selectedSnapshotType = this.navigateType;
      }
    }
  }


  changeTypeSnaphot() {
    this.selectedVolume = null;
    this.selectedVM = null;
    this.quotaSelected = 0;
    this.quotaTypeSelected = '';
    this.isNotPackageQuota = false;
    this.isPackageQuota = false;
    this.isVPCQuota = false;
    this.isNotVPCQuota = false;
  }

  changePackageSnapshot() {
    // dự án thường
    if (this.projectType != 1 && this.selectedSnapshotPackage) {
      this.packageSnapshotService.detail(this.selectedSnapshotPackage.id)
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
        });
    }
    if (this.selectedSnapshotPackage == undefined) {
      this.disableByQuota = false;
      this.disableCreate = true;
    }
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
  // call api change item volume/vm selected

  changeVmVolumeSelected() {
    if (this.selectedSnapshotType == 0 || this.navigateTypeSelected == 0) {
      this.vlService.getVolumeById(this.selectedVolume.id, this.project)
        .pipe(finalize(() => {
          // this.checkDisable();
          this.loadingCreate = false;
        }))
        .subscribe(
          data => {
            this.quotaSelected = data.sizeInGB
            this.quotaTypeSelected = data.volumeType;
            this.selectedVolumeRoot = data;
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
            this.quotaSelected = data.sizeInGB
            this.quotaTypeSelected = data.volumeType;
            this.selectedVolumeRoot = data;
          }
        );
    }
  }
  // navigate form điều chỉnh gói snapshot 
  navigateToPackageSnapshot(id: number) {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/snapshot-advance/packages/edit/' + id]);
    } else {
      this.router.navigate(['/app-smart-cloud/snapshot/packages/edit/' + id]);
    }
  }

}
