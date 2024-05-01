import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { FormCreateFileSystemSnapShot } from 'src/app/shared/models/filesystem-snapshot';
import { IKEPolicyModel } from 'src/app/shared/models/vpns2s.model';
import { RegionModel, ProjectModel } from '../../../../../../../../../libs/common-utils/src';
import { IkePolicyService } from 'src/app/shared/services/ike-policy.service';


@Component({
  selector: 'one-portal-detail-ike-policies',
  templateUrl: './detail-ike-policies.component.html',
  styleUrls: ['./detail-ike-policies.component.less'],
})
export class DetailIkePoliciesComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean = false

  ikePolicy: IKEPolicyModel = new IKEPolicyModel();


  constructor(private ikePolicyService: IkePolicyService,
              private router: Router,
              private activatedRoute: ActivatedRoute
              ) {
  }

  regionChanged(region: RegionModel) {
    this.router.navigate(['/app-smart-cloud/vpn-site-to-site/manage'])
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  userChanged(project: ProjectModel){
    this.router.navigate(['/app-smart-cloud/vpn-site-to-site/manage'])
  }

  getIkePolicyById(id) {
    this.isLoading = true
    this.ikePolicyService.getIkePolicyById(id,this.project,this.region).subscribe(data => {
      this.ikePolicy = data
      console.log(data);
      
      this.isLoading = false
    }, error => {
      this.ikePolicy = null
      this.isLoading = false
    })
  }

  ngOnInit() {
    this.getIkePolicyById(this.activatedRoute.snapshot.paramMap.get('id'))
  }
}
