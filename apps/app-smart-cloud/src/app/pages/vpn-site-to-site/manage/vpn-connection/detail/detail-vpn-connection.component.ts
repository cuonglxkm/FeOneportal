import { Component, OnInit } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { RegionModel } from 'src/app/shared/models/region.model';


@Component({
  selector: 'one-portal-detail-vpn-connection',
  templateUrl: './detail-vpn-connection.component.html',
  styleUrls: ['./detail-vpn-connection.component.less'],
})
export class DetailVpnConnectionComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  
  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
  }


  constructor(
    private router: Router,
    private fb: NonNullableFormBuilder,
  ) {}


  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.project = project?.id;
  }
}
