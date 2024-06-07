import { Component, Inject, OnInit } from '@angular/core';
import { ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import { getCurrentRegionAndProject } from '@shared';
import { debounceTime, finalize, Subject } from 'rxjs';
import { TimeCommon } from '../../../shared/utils/common';
import { Router } from '@angular/router';
import { VolumeService } from '../../../shared/services/volume.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

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
    {label : this.i18n.fanyi('app.button.create'), value : 'KHOITAO'},
    {label : this.i18n.fanyi('service.status.init'), value : 'DANGKHOITAO'},
    {label : this.i18n.fanyi('app.suspend'), value : 'TAMNGUNG'},
    {label : this.i18n.fanyi('app.button.cancel'), value : 'HUY'},
  ];

  typeVpc: number;

  constructor(private router: Router,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private service: VolumeService) {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    this.searchDelay.pipe(debounceTime(TimeCommon.timeOutSearch)).subscribe(() => {
      this.search(false);
    });
    this.search(true);
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
    this.search(true)
    this.typeVpc = project?.type
  }

  navigateToCreate() {
    this.router.navigate(['/app-smart-cloud/snapshot/create'])
  }

  search(isBegin: boolean) {
    this.isLoading = true;
    this.service.serchSnapshot(this.size, this.index, this.region, this.project, this.value, this.status)
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


  navigateToCreateVolume(idSnapshot) {
    if(this.typeVpc == 1) {
      this.router.navigate(['/app-smart-cloud/volume/vpc/create', {snapshotId: idSnapshot}])
    } else {
      this.router.navigate(['/app-smart-cloud/volume/create', {snapshotId: idSnapshot}])
    }
  }
}
