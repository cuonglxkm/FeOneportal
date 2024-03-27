import { Component } from '@angular/core';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { RegionModel } from 'src/app/shared/models/region.model';


@Component({
  selector: 'one-portal-blank-vpn-site-to-site',
  templateUrl: './blank-vpn-site-to-site.component.html',
  styleUrls: ['./blank-vpn-site-to-site.component.less']
})

export class BlankVpnSiteToSiteComponent {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project.id;

  }
}