import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { RegionModel, ProjectModel } from '../../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-create-schedule-backup',
  templateUrl: './create-schedule-backup.component.html',
  styleUrls: ['./create-schedule-backup.component.less']
})
export class CreateScheduleBackupComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  selectedValueRadio = 'VM';

  validateForm: FormGroup<{
    radio: FormControl<any>
  }> = this.fb.group({
    radio: ['']
  });

  id: number;

  backupVmId: number;

  constructor(private fb: NonNullableFormBuilder,
              private location: Location,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
  }


  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    this.router.navigate(['/app-smart-cloud/schedule/backup/list']);

  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/schedule/backup/list']);
  }

  projectChanged(project: ProjectModel) {
    this.project = project;
  }

  goBack() {
    this.location.back();
  }

  onChangeStatus() {
    console.log('Selected option changed:', this.selectedValueRadio);
  }
  instanceId: number

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.instanceId = params['instanceId'];
    });
    this.activatedRoute.queryParams.subscribe(data => {
      console.log(data['idVolume']);
      this.selectedValueRadio = data['type'];
      this.id = data['idVolume'];
      if (data['type'] == null || data['type'] == undefined) {
        this.selectedValueRadio = 'VM';
      }
    });
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
  }


}
