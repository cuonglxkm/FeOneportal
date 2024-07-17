import { Component, ViewChild } from '@angular/core';
import { RegionModel, ProjectModel } from '../../../../../../../libs/common-utils/src';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';


@Component({
  selector: 'one-portal-blank-vpn-site-to-site',
  templateUrl: './blank-vpn-site-to-site.component.html',
  styleUrls: ['./blank-vpn-site-to-site.component.less']
})

export class BlankVpnSiteToSiteComponent {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  regionChanged(region: RegionModel) {
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.region = region.regionId;
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project.id;

  }
}
