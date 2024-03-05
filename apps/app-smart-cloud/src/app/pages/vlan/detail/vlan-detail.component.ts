import {Component, Inject, OnInit} from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {ActivatedRoute, Router} from "@angular/router";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {VlanService} from "../../../shared/services/vlan.service";
import { FormSearchPort, FormSearchSubnet, Port, Subnet } from '../../../shared/models/vlan.model';
import {getCurrentRegionAndProject} from "@shared";
import {ProjectService} from "../../../shared/services/project.service";
import { BaseResponse } from '../../../../../../../libs/common-utils/src';
import { debounceTime } from 'rxjs';
import { VolumeService } from '../../../shared/services/volume.service';
import { GetAllVmModel } from '../../../shared/models/volume.model';
import { InstancesModel } from '../../instances/instances.model';
import { InstancesService } from '../../instances/instances.service';

@Component({
  selector: 'one-portal-vlan-detail',
  templateUrl: './vlan-detail.component.html',
  styleUrls: ['./vlan-detail.component.less'],
})
export class VlanDetailComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  idNetwork: number

  constructor(private router: Router,
              private route: ActivatedRoute) {
  }

  regionChanged(region: RegionModel) {
    this.router.navigate(['/app-smart-cloud/vlan/network/list'])
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/vlan/network/list'])
  }

  ngOnInit() {
    this.idNetwork = Number.parseInt(this.route.snapshot.paramMap.get('id'))
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId

    console.log('project', this.project)
  }

}
