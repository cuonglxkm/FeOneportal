import { Component } from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";

@Component({
  selector: 'one-portal-iam-dashboard',
  templateUrl: './iam-dashboard.component.html',
  styleUrls: ['./iam-dashboard.component.less'],
})
export class IamDashboardComponent {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  listOfData = [
    {
      count_group: 3,
      count_user: 0,
    }
  ]
  regionChanged(region: RegionModel) {
    this.region = region.regionId
    // this.formSearch.regionId = this.region
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
    // this.formSearch.project = this.project
  }
}
