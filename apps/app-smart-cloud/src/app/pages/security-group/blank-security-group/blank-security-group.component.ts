import { Component } from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";

@Component({
  selector: 'one-portal-bank-security-group',
  templateUrl: './blank-security-group.component.html',
  styleUrls: ['./blank-security-group.component.less'],
})
export class BlankSecurityGroupComponent {
  region: number;

  project: number;

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }


}
