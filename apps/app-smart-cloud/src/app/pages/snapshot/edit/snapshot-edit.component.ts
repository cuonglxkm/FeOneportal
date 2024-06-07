// import { Component, Inject, OnInit } from '@angular/core';
// import { ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
// import { ALAIN_I18N_TOKEN } from '@delon/theme';
// import { I18NService } from '@core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { LoadBalancerService } from '../../../shared/services/load-balancer.service';
// import { CatalogService } from '../../../shared/services/catalog.service';
// import { NzNotificationService } from 'ng-zorro-antd/notification';
// import { getCurrentRegionAndProject } from '@shared';
// import { VolumeService } from '../../../shared/services/volume.service';
//
// @Component({
//   selector: 'one-portal-snapshot-edit',
//   templateUrl: './snapshot-edit.component.html',
//   styleUrls: ['./snapshot-edit.component.less'],
// })
// export class SnapshotEditComponent implements OnInit{
//   region = JSON.parse(localStorage.getItem('regionId'));
//   project = JSON.parse(localStorage.getItem('projectId'));
//   data: any;
//
//   constructor(@Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
//               private router: Router,
//               private activatedRoute: ActivatedRoute,
//               private service: VolumeService,
//               private notification: NzNotificationService) {
//   }
//
//   ngOnInit() {
//     const id = this.activatedRoute.snapshot.paramMap.get('id');
//     this.loadData(id);
//     let regionAndProject = getCurrentRegionAndProject()
//     this.region = regionAndProject.regionId
//     this.project = regionAndProject.projectId
//   }
//
//   regionChanged(region: RegionModel) {
//     this.region = region.regionId;
//     this.router.navigate(['/app-smart-cloud/load-balancer/list'])
//   }
//
//   projectChanged(project: ProjectModel) {
//     this.project = project?.id;
//   }
//
//   private loadData(id: string) {
//
//   }
// }
