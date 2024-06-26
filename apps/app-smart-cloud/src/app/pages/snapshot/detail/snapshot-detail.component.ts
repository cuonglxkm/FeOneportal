import { Component, Inject, OnInit } from '@angular/core';
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

  validateForm: FormGroup<{
    description: FormControl<string>
  }> = this.fb.group({
    description: ['', []],
  });
  constructor(@Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private fb: NonNullableFormBuilder,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private service: VolumeService,
              private packageSnapshotService: PackageSnapshotService,
              private notification: NzNotificationService) {
  }

  ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.id = id;
    this.loadData(id);
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
    this.validateForm.controls['description'].disable();
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
    this.typeProject = project?.type;
  }

  private loadData(id: string) {
    this.service.getDetailSnapshot(id)
      .pipe(finalize(() => {
        this.loadPackageSnapshot(this.data.snapshotPackageId);
      }))
      .subscribe(
      data => {
        this.data = data;
        this.validateForm.controls['description'].setValue(data.description);
      }
    )
  }

  userChanged($event: any) {
    this.router.navigate(['/app-smart-cloud/load-balancer/list'])
  }

  private loadPackageSnapshot(snapshotPackageId) {
    this.packageSnapshotService.detail(snapshotPackageId, this.project).subscribe(data => {
      console.log('data', data);
      this.packageSnap = data;
    });
  }
}
