import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RegionModel } from '../../../../shared/models/region.model';
import { ProjectModel } from '../../../../shared/models/project.model';

@Component({
  selector: 'one-portal-list-access-rule',
  templateUrl: './list-access-rule.component.html',
  styleUrls: ['./list-access-rule.component.less'],
})
export class ListAccessRuleComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  value: string

  constructor(private router: Router) {
  }

  onInputChange(value) {
    this.value = value
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  ngOnInit() {
  }
}
