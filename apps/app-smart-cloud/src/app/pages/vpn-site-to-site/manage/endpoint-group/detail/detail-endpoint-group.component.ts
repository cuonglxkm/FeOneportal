import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { getCurrentRegionAndProject } from '@shared';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { RegionModel } from 'src/app/shared/models/region.model';
import { FormDetailEndpointGroup } from 'src/app/shared/models/ipsec-policy';
import { EndpointGroupService } from 'src/app/shared/services/endpoint-group.service';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'one-portal-detail-endpoint-group',
  templateUrl: './detail-endpoint-group.component.html',
  styleUrls: ['./detail-endpoint-group.component.less'],
})
export class DetailEndpointGroupComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean = false

  endpointGroup: FormDetailEndpointGroup = new FormDetailEndpointGroup();

  constructor(private endpointGroupService: EndpointGroupService,
              private router: Router,
              private activatedRoute: ActivatedRoute
              ) {
  }

  oregionChanged(region: RegionModel) {
    this.router.navigate(['/app-smart-cloud/vpn-site-to-site/manage'])
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  userChanged(project: ProjectModel){
    this.router.navigate(['/app-smart-cloud/vpn-site-to-site/manage'])
  }

  getEndpointGroupById(id) {
    this.isLoading = true
    this.endpointGroupService.getEndpointGroupById(id,this.project,this.region).subscribe(data => {
      this.endpointGroup = data
      console.log(data);
      
      this.isLoading = false
    }, error => {
      this.endpointGroup = null
      this.isLoading = false
    })
  }

  ngOnInit() {
    this.getEndpointGroupById(this.activatedRoute.snapshot.paramMap.get('id'))
  }
}
