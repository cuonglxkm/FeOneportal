import { Component, Inject, OnInit } from '@angular/core';
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

@Component({
  selector: 'one-portal-snapshot-create',
  templateUrl: './snapshot-create.component.html',
  styleUrls: ['./snapshot-create.component.less'],
})
export class SnapshotCreateComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));
  orderItem: any;
  loadingCaCulate = false;

  validateForm: FormGroup<{
    name: FormControl<string>
    description: FormControl<string>
    quota: FormControl<string>
  }> = this.fb.group({
    name: ['', [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9_]*$/),
      Validators.maxLength(50)]],
    description: ['', Validators.maxLength(255)],
    quota: ['0GB', []],
  });

  snapShotArray = [
    {label : 'Snapshot Volume', value : 0},
    {label : 'Snapshot máy ảo', value : 1},
  ]
  vmArray: any;
  volumeArray = [];
  snapshotPackageArray: any;
  vmLoading = true;
  volumeLoading = true;
  snapshotPackageLoading = true;

  selectedSnapshotType = 0;
  selectedVolume : any;
  selectedVM : any;
  selectedSnapshotPackage : any;
  projectType = 0;
  constructor(private router: Router,
              private packageSnapshotService: PackageSnapshotService,
              private volumeService: VolumeService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private notification: NzNotificationService,
              private instancesService: InstancesService,
              private activatedRoute: ActivatedRoute,
              private loadingSrv: LoadingService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private fb: NonNullableFormBuilder,) {
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    this.loadSnapshotPackage();
    this.loadVolumeList();
    this.loadVmList();
    this.validateForm.controls['quota'].disable();
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  navigateToPaymentSummary() {
    const data = {
      name: this.validateForm.controls['name'].value,
      description: this.validateForm.controls['description'].value,
      volumeId: this.selectedSnapshotType == 0 ? this.selectedVolume.id : null,
      vmId: this.selectedSnapshotType == 1 ? this.selectedVM.id : null,
      region: this.region,
      projectId: this.project,
      scheduleId: null,
      forceCreate: true,
      snapshotPackageId: this.selectedSnapshotPackage.id,
    }
    this.volumeService.createSnapshot(data).subscribe(
      data => {
        this.notification.error(this.i18n.fanyi("app.status.success"),'Tạo thành công')
        this.router.navigate(['/app-smart-cloud/snapshot'])
      },
      error => {
        this.notification.error(this.i18n.fanyi("app.status.fail"),'Tạo thất bại')
      }
    )
  }

  userChanged($event: any) {
    //navigate list
    this.router.navigate(['/app-smart-cloud/snapshot'])
  }

  formSearchPackageSnapshot: FormSearchPackageSnapshot = new FormSearchPackageSnapshot()
  disableCreate = true;
  quota : string = '1GB';
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
        this.snapshotPackageArray = data.records;
      }
    )
  }

  private loadVolumeList() {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.volumeService.getVolumes(this.tokenService.get()?.userId,this.project, this.region, 9999, 1 , 'KHOITAO', '')
      .pipe(finalize(() => {
        this.volumeLoading = false;
      }))
      .subscribe(
      data => {
        this.volumeArray = data?.records.filter(item => {
          return item.serviceStatus === 'AVAILABLE';
        });
        if (this.activatedRoute.snapshot.paramMap.get('volumeId') != undefined || this.activatedRoute.snapshot.paramMap.get('volumeId') != null) {
          this.selectedSnapshotType = 0;
          this.selectedVolume = this.vmArray.filter(e => e.id == Number.parseInt(this.activatedRoute.snapshot.paramMap.get('volumeId')))[0];
        } else {
          this.selectedVolume = null;
          this.selectedSnapshotType = 1;
        }
        // this.volumeArray = data.records;
      }
    )
  }

  private loadVmList() {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.instancesService.search(1 , 9999, this.region, this.project, '', '' , true, this.tokenService.get()?.userId)
      .pipe(finalize(() => {
        this.loadingSrv.close();
        this.vmLoading = false;
      }))
      .subscribe(
        data => {
          const rs1 = data.records.filter(item => {
            return item.taskState === 'ACTIVE';
          });
        this.vmArray = rs1;
        if (this.activatedRoute.snapshot.paramMap.get('instanceId') != undefined || this.activatedRoute.snapshot.paramMap.get('instanceId') != null) {
          this.selectedSnapshotType = 1;
          this.selectedVM = this.vmArray.filter(e => e.id == Number.parseInt(this.activatedRoute.snapshot.paramMap.get('instanceId')))[0];
        } else {
          this.selectedVM = null;
          this.selectedSnapshotType = 0;
        }
      }
    )
  }

  checkDisable() {
    this.disableCreate = false;
    if (this.selectedSnapshotPackage == undefined ||
      (this.selectedSnapshotType == 0 && this.selectedVolume == undefined) ||
      (this.selectedSnapshotType == 1 && this.selectedVM == undefined)) {
      this.disableCreate = true;
    }

    if (this.selectedSnapshotType == 0) {
      this.validateForm.controls['quota'].setValue(this.selectedVolume.sizeInGB + 'GB');
    } else if (this.selectedSnapshotType == 1 ) {
      this.validateForm.controls['quota'].setValue(this.selectedVM.storage + 'GB');
    } else {
      this.validateForm.controls['quota'].setValue('0GB');
    }
  }
}
