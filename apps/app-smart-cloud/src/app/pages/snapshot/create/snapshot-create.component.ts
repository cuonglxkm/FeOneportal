import { Component, OnInit } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { Router } from '@angular/router';
import { ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';

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
    radio: FormControl<any>
    subnet: FormControl<string>
    ipAddress: FormControl<string>
    ipFloating: FormControl<number>
    offer: FormControl<number>
    description: FormControl<string>
    time: FormControl<number>
  }> = this.fb.group({
    name: ['', [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9_]*$/),
      Validators.maxLength(50)]],
    radio: [''],
    subnet: ['', Validators.required],
    ipAddress: ['', Validators.pattern(/^(25[0-4]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-4]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$/)],
    ipFloating: [-1, [Validators.required,Validators.pattern(/^[0-9]+$/)]],
    offer: [1, Validators.required],
    description: ['', Validators.maxLength(255)],
    time: [1, Validators.required]
  });

  constructor(private router: Router,
              private fb: NonNullableFormBuilder,) {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  navigateToPaymentSummary() {

  }

  userChanged($event: any) {
    //navigate list
  }
}
