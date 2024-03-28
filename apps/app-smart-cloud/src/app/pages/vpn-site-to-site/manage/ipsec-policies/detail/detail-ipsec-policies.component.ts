import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { FormCreateFileSystemSnapShot } from 'src/app/shared/models/filesystem-snapshot';
import { IpsecPolicyDetail } from 'src/app/shared/models/ipsec-policy';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { RegionModel } from 'src/app/shared/models/region.model';
import { IpsecPolicyService } from 'src/app/shared/services/ipsec-policy.service';


@Component({
  selector: 'one-portal-detail-ipsec-policies',
  templateUrl: './detail-ipsec-policies.component.html',
  styleUrls: ['./detail-ipsec-policies.component.less'],
})
export class DetailIpsecPoliciesComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean = false

  ipsecPolicy: IpsecPolicyDetail = new IpsecPolicyDetail();


  constructor(private ipsecPolicyService: IpsecPolicyService,
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

  getIpsecPolicyById(id) {
    this.isLoading = true
    this.ipsecPolicyService.getIpsecPoliciesById(id,this.project,this.region).subscribe(data => {
      this.ipsecPolicy = data
      console.log(data);
      
      this.isLoading = false
    }, error => {
      this.ipsecPolicy = null
      this.isLoading = false
    })
  }

  ngOnInit() {
    this.getIpsecPolicyById(this.activatedRoute.snapshot.paramMap.get('id'))
  }
}
