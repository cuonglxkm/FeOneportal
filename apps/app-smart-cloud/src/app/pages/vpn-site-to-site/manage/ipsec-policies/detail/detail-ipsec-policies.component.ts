import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { FormCreateFileSystemSnapShot } from 'src/app/shared/models/filesystem-snapshot';
import { IpsecPolicyDetail } from 'src/app/shared/models/ipsec-policy';
import { RegionModel, ProjectModel } from '../../../../../../../../../libs/common-utils/src';
import { IpsecPolicyService } from 'src/app/shared/services/ipsec-policy.service';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';


@Component({
  selector: 'one-portal-detail-ipsec-policies',
  templateUrl: './detail-ipsec-policies.component.html',
  styleUrls: ['./detail-ipsec-policies.component.less'],
})
export class DetailIpsecPoliciesComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean = false

  ipsecPolicy: IpsecPolicyDetail = new IpsecPolicyDetail();
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;

  constructor(private ipsecPolicyService: IpsecPolicyService,
              private router: Router,
              private activatedRoute: ActivatedRoute
              ) {
  }

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
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

  getIpsecPolicyById(id) {
    this.isLoading = true
    this.ipsecPolicyService.getIpsecPoliciesById(id,this.project,this.region).subscribe(data => {
      this.ipsecPolicy = data
      
      
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
