import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {RegionModel} from "../../../../shared/models/region.model";
import {ProjectModel} from "../../../../shared/models/project.model";

@Component({
    selector: 'one-portal-create-security-group-inbound',
    templateUrl: './create-inbound.component.html',
    styleUrls: ['./create-inbound.component.less'],
})
export class CreateInboundComponent implements OnInit {
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
            console.log('Received value:', value);
            this.securityGroupId = value;
        });
    }
}
