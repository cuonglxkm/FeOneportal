import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RegionModel } from 'src/app/shared/models/region.model';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'one-portal-add-policies',
  templateUrl: './add-policies.component.html',
  styleUrls: ['./add-policies.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPoliciesComponent implements OnInit {
  regionId: number;
  projectId: number;
  userName: any;
  originGroupNames = [];
  originPolicyNames = [];
  groupNames: any[] = [];
  policyNames: any[] =[]

  constructor(
    private service: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.userName = this.activatedRoute.snapshot.paramMap.get('userName');
    this.getuserDetail();
  }

  getuserDetail() {

  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    // this.getSshKeys();
  }

  onProjectChange(project: ProjectModel) {
    this.projectId = project.id;
    // this.getSshKeys();
  }

  onChangeGroupNames(event: any[]) {
    this.groupNames = event;
  }

  onChangePolicyNames(event: any[]) {
    this.policyNames = event;
  }

  addPolicies() {

  }
  
  navigateToDetail() {
    this.router.navigate(['/app-smart-cloud/users/detail/' +this.userName]);
  }
}
