import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import { getCurrentRegionAndProject } from '@shared';
import { debounceTime, finalize, Subject } from 'rxjs';
import { TimeCommon } from '../../../shared/utils/common';
import { Router } from '@angular/router';
import { VolumeService } from '../../../shared/services/volume.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { data } from 'vis-network';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { RegionID } from 'src/app/shared/enums/common.enum';

@Component({
  selector: 'one-portal-snapshot-list',
  templateUrl: './snapshot-list.component.html',
  styleUrls: ['./snapshot-list.component.less'],
})
export class SnapshotListComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));
  isBegin = false;
  value: string = '';
  searchDelay = new Subject<boolean>();
  isLoading = true;
  index = 1;
  size = 10;
  response: any;
  status: any = '';
  listStatus = [
    {label : this.i18n.fanyi('app.status.all'), value : ''},
    {label : this.i18n.fanyi('service.status.active'), value : 'KHOITAO'},
    {label : this.i18n.fanyi('service.status.init'), value : 'DANGKHOITAO'},
    {label : this.i18n.fanyi('app.suspend'), value : 'TAMNGUNG'},
    {label : this.i18n.fanyi('app.button.cancel'), value : 'HUY'},
  ];
  isVisibleDelete = false;
  modalStyle = {
    'padding': '20px',
    'border-radius': '10px',
    'width': '600px',
  };
  validateForm: FormGroup<{
    name: FormControl<string>
    description: FormControl<string>
  }> = this.fb.group({
    name: ['', [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9_]*$/),
      Validators.maxLength(50)]],
    description: ['', Validators.maxLength(255)],
  });

  typeVpc: number;

  dataSelected: any;
  nameDelete = '';
  disableDelete = true;
  loadingDelete = false;
  isVisibleEdit: boolean;
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  constructor(private router: Router,
              private fb: NonNullableFormBuilder,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private notification: NzNotificationService,
              private service: VolumeService) {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
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
    } else {
      this.region = RegionID.ADVANCE;
    }
    this.searchDelay.pipe(debounceTime(TimeCommon.timeOutSearch)).subscribe(() => {
      this.search(false);
    });
    this.search(true);
  }

  regionChanged(region: RegionModel) {
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.region = region.regionId;
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
    this.search(true)
    this.typeVpc = project?.type
  }

  navigateToCreate() {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/snapshot-advance/create',  {
        navigateType: 2
      }])
    } else {
      this.router.navigate(['/app-smart-cloud/snapshot/create',  {
        navigateType: 2
      }])
    }
  }

  navigateToDetail(id){
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate([`/app-smart-cloud/snapshot-advance/detail`, id])
    } else {
      this.router.navigate([`/app-smart-cloud/snapshot/detail`, id])
    }
  }

  navigateToPackageDetail(id){
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate([`/app-smart-cloud/snapshot-advance/packages/detail/`, id])
    } else {
      this.router.navigate([`/app-smart-cloud/snapshot/packages/detail/`, id])
    }
  }

  search(isBegin: boolean) {
    this.isLoading = true;
    this.service.serchSnapshot(this.size, this.index, this.region, this.project, this.value, this.status, '')
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe(
      data => {
        this.response = data
        if (isBegin) {
          if (this.response.records.length <= 0) {
            this.isBegin = true;
          } else {
            this.isBegin = false;
          }
        }
      }
    );
  }

  onPageIndexChange($event: number) {
    this.index = $event;
    this.search(false)
  }

  onPageSizeChange($event: number) {
    this.size = $event;
    this.search(false)

  }


  navigateToCreateVolumeVM(idSnapshot, type: any) {
    if (type == 0) {
      if(this.typeVpc == 1) {
        if (this.region === RegionID.ADVANCE) {
          this.router.navigate(['/app-smart-cloud/volume-advance/vpc/create', {idSnapshot: idSnapshot}])
        } else {
          this.router.navigate(['/app-smart-cloud/volume/vpc/create', {idSnapshot: idSnapshot}])
        } 
      } else {
        if (this.region === RegionID.ADVANCE) {
          this.router.navigate(['/app-smart-cloud/volume-advance/create', {idSnapshot: idSnapshot}])
        } else {
          this.router.navigate(['/app-smart-cloud/volume/create', {idSnapshot: idSnapshot}])
        } 
      }
    } else if (type == 1) {
      if(this.typeVpc == 1) {
        if (this.region === RegionID.ADVANCE) {
          this.router.navigate(['/app-smart-cloud/instances-advance/instances-create-vpc', {idSnapshot: idSnapshot}])
        } else {
          this.router.navigate(['/app-smart-cloud/instances/instances-create-vpc', {idSnapshot: idSnapshot}])
        } 
        
      } else {
        if (this.region === RegionID.ADVANCE) {
          this.router.navigate(['/app-smart-cloud/instances-advance/instances-create', {idSnapshot: idSnapshot}])
        } else {
          this.router.navigate(['/app-smart-cloud/instances/instances-create', {idSnapshot: idSnapshot}])
        } 
      }
    }
  }

  handleCancel() {
    this.isVisibleDelete = false;
    this.isVisibleEdit = false;
    this.nameDelete = '';
    this.dataSelected = null;
  }

  enableDelete(data: any) {
    this.dataSelected = data;
    this.isVisibleDelete = true;
  }

  openIpDeleteCf() {
    if (this.disableDelete == false) {
      this.openIpDelete();
    }
  }

  confirmNameDelete($event: any) {
    if ($event == this.dataSelected.name) {
      this.disableDelete = false;
    } else {
      this.disableDelete = true;
    }
  }

  openIpDelete() {
    this.loadingDelete = true;
    this.service.deleteSnapshot(this.dataSelected.id)
      .pipe(finalize(() => {
        this.loadingDelete = false;
        this.handleCancel();
      }))
      .subscribe(
      data => {
        this.notification.success(this.i18n.fanyi('app.status.success'), 'success');
        this.search(true);
      },
      error => {
        this.notification.error(this.i18n.fanyi('app.status.fail'), 'fail');
      }
    )
  }

  enableEdit(data: any) {
    this.dataSelected = data;
    this.isVisibleEdit = true;
    this.validateForm.controls['name'].setValue(data.name);
    this.validateForm.controls['description'].setValue(data.description);
  }

  updateSnapshot() {
    this.loadingDelete = true;
    const data = {
      id : this.dataSelected.id,
      name : this.validateForm.controls['name'].value,
      description : this.validateForm.controls['description'].value,
    }
    this.service.updateSnapshot(data)
      .pipe(finalize(() => {
        this.loadingDelete = false;
        this.handleCancel();
      }))
      .subscribe(
        data => {
          this.notification.success(this.i18n.fanyi('app.status.success'), 'success');
          this.search(true);
        },
        error => {
          this.notification.error(this.i18n.fanyi('app.status.fail'), 'fail');
        }
      )
  }

  navigateCreateVl() {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/volume-advance/create'])
    } else {
      this.router.navigate(['/app-smart-cloud/volume/create'])
    }
    
  }
}
