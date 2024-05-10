import { Component, OnInit } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { RegionModel } from 'src/app/shared/models/region.model';
import { VpnConnectionDetail } from 'src/app/shared/models/vpn-connection';
import { VpnConnectionService } from 'src/app/shared/services/vpn-connection.service';

@Component({
  selector: 'one-portal-detail-vpn-connection',
  templateUrl: './detail-vpn-connection.component.html',
  styleUrls: ['./detail-vpn-connection.component.less'],
})
export class DetailVpnConnectionComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean = false;

  vpnConnection: VpnConnectionDetail = new VpnConnectionDetail();

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    this.getVpnConnectionById(this.activatedRoute.snapshot.paramMap.get('id'))
  }

  constructor(
    private vpnConnectionService: VpnConnectionService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.project = project?.id;
  }

  getVpnConnectionById(id) {
    this.isLoading = true;
    this.vpnConnectionService
      .getVpnConnectionById(id, this.project, this.region)
      .subscribe(
        (data) => {
          this.vpnConnection = data;
          console.log(data);

          this.isLoading = false;
        },
        (error) => {
          this.vpnConnection = null;
          this.isLoading = false;
        }
      );
  }
}
