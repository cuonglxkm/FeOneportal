import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { getCurrentRegionAndProject } from '@shared';
import { VolumeService } from 'src/app/shared/services/volume.service';
import { RegionModel } from 'src/app/shared/models/region.model';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { BaseResponse } from '../../../../../../../libs/common-utils/src';
import { VolumeDTO } from 'src/app/shared/dto/volume.dto';

@Component({
  selector: 'one-portal-vpn-site-to-site-manage',
  templateUrl: './vpn-site-to-site-manage.component.html',
  styleUrls: ['./vpn-site-to-site-manage.component.less']
})

export class VpnSiteToSiteManage implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));


  isBegin: boolean = false;

  constructor() {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project.id;

  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
  }

}
