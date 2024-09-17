import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { ActivatedRoute, Router } from '@angular/router';
import { VolumeService } from '../../../shared/services/volume.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { getCurrentRegionAndProject } from '@shared';
import { ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import { finalize } from 'rxjs';
import { da } from 'date-fns/locale';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { PackageSnapshotService } from '../../../shared/services/package-snapshot.service';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { RegionID } from 'src/app/shared/enums/common.enum';

@Component({
  selector: 'one-portal-snapshot-detail',
  templateUrl: './snapshot-detail.component.html',
  styleUrls: ['./snapshot-detail.component.less'],
})
export class SnapshotDetailComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));
  data: any;
  id: any
  typeProject: any;
  packageSnap: any;
  packageSize:number;
  titleBreadcrumb:string;
  breadcrumbBlockStorage:string;

  validateForm: FormGroup<{
    description: FormControl<string>
  }> = this.fb.group({
    description: ['', []],
  });
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  constructor(@Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private fb: NonNullableFormBuilder,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private service: VolumeService,
              private packageSnapshotService: PackageSnapshotService,
              private notification: NzNotificationService) {
  }
  url = window.location.pathname;
  ngOnInit() {
    if (!this.url.includes('advance')) {
      if (Number(localStorage.getItem('regionId')) === RegionID.ADVANCE) {
        this.region = RegionID.NORMAL;
      } else {
        this.region = Number(localStorage.getItem('regionId'));
      }
       this.titleBreadcrumb ='Dịch vụ hạ tầng'
        this.breadcrumbBlockStorage ='Block Storage'
    } else {
      this.region = RegionID.ADVANCE;
       this.titleBreadcrumb ='Dịch vụ nâng cao'
        this.breadcrumbBlockStorage ='Block Storage nâng cao'
    }
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.id = id;
    this.loadData(id, this.project, this.region);
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
    this.validateForm.controls['description'].disable();
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
    this.typeProject = project?.type;
  }

  private loadData(id: string,projectId:number, regionId:number ) {
    this.service.getDetailSnapshot(id, this.project)
      .pipe(finalize(() => {
        this.loadPackageSnapshot(this.data.snapshotPackageId);
      }))
      .subscribe(
      data => {
        this.data = data;
        this.loadPackageSnapshot(this.data.snapshotPackageId);
        console.log("aaa", this.data)
        console.log("volumeType", this.data.volumeType)
       
       
        this.validateForm.controls['description'].setValue(data.description);
      },error =>{      
        if(error.status===500){
          this.navigateToSnapshot();
          // this.router.navigate(['/app-smart-cloud/snapshot']);
          this.notification.error('Thất bại',error.error.message );
        }
        
      });
  }

  navigateToDetail(){
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate([`/app-smart-cloud/snapshot-advance/detail`, this.id])
    } else {
      this.router.navigate([`/app-smart-cloud/snapshot/detail`, this.id])
    }
  }

  userChanged($event: any) {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/snapshot-advance'])
    } else {
      this.router.navigate(['/app-smart-cloud/snapshot'])
    }
  }
  navigateToSnapshot() {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/snapshot-advance'])
    } else {
      this.router.navigate(['/app-smart-cloud/snapshot'])
    }
  }

  private loadPackageSnapshot(snapshotPackageId) {
    this.packageSnapshotService.detail(snapshotPackageId).subscribe(data => {
    
      this.packageSnap = data;
      console.log('packageSnap', this.packageSnap);
      if(this.data.volumeType ==='hdd'){
        this.packageSize = this.packageSnap.sizeHddInGB
       }
       else if(this.data.volumeType ==='ssd'){
        this.packageSize = this.packageSnap.sizeSsdInGb
       }
       console.log("object packageSnap", this.packageSize)
    });
  }
}
