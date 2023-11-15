import {Component, OnInit} from '@angular/core';
import {IpPublicService} from "../../../shared/services/ip-public.service";
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";

@Component({
  selector: 'one-portal-create-update-ip-public',
  templateUrl: './create-update-ip-public.component.html',
  styleUrls: ['./create-update-ip-public.component.less'],
})
export class CreateUpdateIpPublicComponent implements OnInit{
  regionId: number;
  projectId: number;
  checked = true;
  selectedAction: any;
  constructor(private service: IpPublicService) {
  }

  ngOnInit(): void {
    this.service.model.next("1234")
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    // this.getSshKeys();
  }

  projectChange(project: ProjectModel) {
    this.projectId = project.id;
    // this.getSshKeys();
  }

}
