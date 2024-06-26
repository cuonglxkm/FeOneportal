import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { getCurrentRegionAndProject } from '@shared';
import { FormDetailEndpointGroup } from 'src/app/shared/models/endpoint-group';
import { EndpointGroupService } from 'src/app/shared/services/endpoint-group.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RegionModel, ProjectModel } from '../../../../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-detail-endpoint-group',
  templateUrl: './detail-endpoint-group.component.html',
  styleUrls: ['./detail-endpoint-group.component.less'],
})
export class DetailEndpointGroupComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean = false;

  endpointGroup: FormDetailEndpointGroup = new FormDetailEndpointGroup();

  constructor(
    private endpointGroupService: EndpointGroupService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
    this.router.navigate(['/app-smart-cloud/vpn-site-to-site']);
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.project = project?.id;
  }

  userChangeProject(){
    this.router.navigate(['/app-smart-cloud/vpn-site-to-site']);
  }

  getEndpointGroupById(id) {
    this.isLoading = true;
    this.endpointGroupService
      .getEndpointGroupById(id, this.project, this.region)
      .subscribe(
        (data) => {
          this.endpointGroup = data;
          console.log(data);

          this.isLoading = false;
        },
        (error) => {
          this.endpointGroup = null;
          this.isLoading = false;
        }
      );
  }

  ngOnInit() {
    this.getEndpointGroupById(this.activatedRoute.snapshot.paramMap.get('id'));
  }
}
