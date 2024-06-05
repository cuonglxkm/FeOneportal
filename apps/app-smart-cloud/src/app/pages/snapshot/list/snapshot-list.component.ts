import { Component, OnInit } from '@angular/core';
import { ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import { getCurrentRegionAndProject } from '@shared';
import { debounceTime, Subject } from 'rxjs';
import { TimeCommon } from '../../../shared/utils/common';
import { Router } from '@angular/router';

@Component({
  selector: 'one-portal-snapshot-list',
  templateUrl: './snapshot-list.component.html',
  styleUrls: ['./snapshot-list.component.less'],
})
export class SnapshotListComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));
  isBegin = false;
  value: string;
  searchDelay = new Subject<boolean>();
  isLoading = true;
  index = 1;
  size = 10;
  response: any;

  constructor(private router: Router,) {
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
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  navigateToCreate() {
    this.router.navigate(['/app-smart-cloud/snapshot/create'])
  }

  search(isBegin: boolean) {

  }

  onPageIndexChange($event: number) {

  }

  onPageSizeChange($event: number) {

  }
}
