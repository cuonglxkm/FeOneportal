import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, NonNullableFormBuilder} from "@angular/forms";
import {Location} from "@angular/common";
import {ActivatedRoute} from "@angular/router";
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";

@Component({
  selector: 'one-portal-create-schedule-backup',
  templateUrl: './create-schedule-backup.component.html',
  styleUrls: ['./create-schedule-backup.component.less'],
})
export class CreateScheduleBackupComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  selectedValueRadio = 'VM';

  validateForm: FormGroup<{
    radio: FormControl<any>
  }> = this.fb.group({
    radio: [''],
  })

  backupVmId: number

  constructor(private fb: NonNullableFormBuilder,
              private location: Location,
              private route: ActivatedRoute) {
  }


  regionChanged(region: RegionModel) {
    this.region = region.regionId

  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  goBack() {
    this.location.back();
  }

  onChangeStatus() {
    console.log('Selected option changed:', this.selectedValueRadio);
  }

  ngOnInit(): void {
    this.project = JSON.parse(localStorage.getItem('projectId'));
  }


}
