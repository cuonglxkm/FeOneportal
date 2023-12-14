import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RegionModel } from 'src/app/shared/models/region.model';
import {
  CopyUserPolicies,
  GroupCreateUser,
  PermissionPolicies,
} from 'src/app/shared/models/user.model';
import { UserService } from 'src/app/shared/services/user.service';
import { finalize } from 'rxjs';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { ProjectModel } from 'src/app/shared/models/project.model';

@Component({
  selector: 'one-portal-add-policies',
  templateUrl: './add-policies.component.html',
  styleUrls: ['./add-policies.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPoliciesComponent implements OnInit {
  regionId: number;
  projectId: number;
  id: any;
  groupNames: any[] = [];
  policyNames: any[] =[]

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    // this.getSshKeys();
  }

  onProjectChange(project: ProjectModel) {
    // this.projectId = project.id;
    // this.getSshKeys();
  }

  onChangeGroupNames(event: any[]) {
    this.groupNames = event;
  }

  onChangePolicyNames(event: any[]) {
    this.policyNames = event;
  }

  navigateToCreate() {}
  
  navigateToDetail() {
    this.router.navigate(['/app-smart-cloud/users/detail/' +this.id]);
  }
}
