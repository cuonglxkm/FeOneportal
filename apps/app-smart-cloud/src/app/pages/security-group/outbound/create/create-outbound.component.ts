import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {RegionModel} from "../../../../shared/models/region.model";

@Component({
  selector: 'one-portal-outbound',
  templateUrl: './create-outbound.component.html',
  styleUrls: ['./create-outbound.component.less'],
})
export class CreateOutboundComponent implements OnInit{
  region: number;
  securityGroupId: string;
  constructor(private route: ActivatedRoute) {
  }
  regionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(queryParams => {
      const value = queryParams['param'];
      console.log('Received value:', value);
      this.securityGroupId = value;
    });
  }
}
