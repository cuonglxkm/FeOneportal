import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";

@Component({
  selector: 'one-portal-list-schedule-backup',
  templateUrl: './list-schedule-backup.component.html',
  styleUrls: ['./list-schedule-backup.component.less'],
})
export class ListScheduleBackupComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  listScheduleBackup = []

  selectedValue?: string = null
  value?: string;

  status = [
    {label: 'Tất cả', value: 'all'},
    {label: 'Hoạt động', value: 'ACTIVE'},
    {label: 'Gián đoạn', value: 'DISABLED'},
    {label: 'Tạm dừng', value: 'PAUSED'}
  ]

  constructor(private router: Router) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  onChange(value: string) {
    console.log('abc', this.selectedValue)
    this.selectedValue = value;
    // if (this.selectedValue === 'all') {
    //   this.formSearch.status = null
    // } else {
    //   this.formSearch.status = value
    // }
  }

  onInputChange(value: string) {
    this.value = value;
    console.log('input text: ', this.value)
  }

  navigateToCreate() {
    this.router.navigate(['/app-smart-cloud/schedule/backup/create'])
  }

  ngOnInit(): void {
    console.log('this.lis', this.listScheduleBackup)
    // if(this.listScheduleBackup === undefined || this.listScheduleBackup.length <= 0) {
    //   this.router.navigate(['/app-smart-cloud/schedule/backup/blank'])
    // } else {
    //
    // }
  }
}
