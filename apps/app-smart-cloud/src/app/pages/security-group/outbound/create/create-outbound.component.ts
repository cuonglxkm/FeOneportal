import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {RegionModel} from "../../../../shared/models/region.model";
import {ProjectModel} from "../../../../shared/models/project.model";

@Component({
  selector: 'one-portal-outbound',
  templateUrl: './create-outbound.component.html',
  styleUrls: ['./create-outbound.component.less'],
})
export class CreateOutboundComponent implements OnInit{
  region: number;
  securityGroupId: string;
  project: number;

  constructor(private route: ActivatedRoute) {
  }
  regionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe(queryParams => {
      const value = queryParams['param'];
      const region = queryParams['region'];
      const project = queryParams['project'];
      console.log('Received value:', value);
      this.securityGroupId = value;
      this.region = parseInt(region);
      this.project = parseInt(project);
      console.log('Received value 2:', this.region);
      console.log('Received value 3 :', this.project);
    });
  }
}
