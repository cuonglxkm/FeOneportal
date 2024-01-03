import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RegionModel } from 'src/app/shared/models/region.model';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { UserService } from 'src/app/shared/services/user.service';
import { UserCreate, User } from 'src/app/shared/models/user.model';
import { finalize } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LoadingService } from '@delon/abc/loading';

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
  userDetail: User;
  userUpdate: UserCreate = new UserCreate();
  originGroupNames = [];
  originPolicyNames = [];
  groupNames: any[] = [];
  policyNames = new Set<string>();

  constructor(
    private service: UserService,
    private router: Router,
    public message: NzMessageService,
    private activatedRoute: ActivatedRoute,
    private loadingSrv: LoadingService
  ) {}

  ngOnInit(): void {
    this.userName = this.activatedRoute.snapshot.paramMap.get('userName');
    this.getuserDetail();
  }

  getuserDetail() {
    this.service.getUserByUsername(this.userName).subscribe((data: any) => {
      this.userDetail = data;
    });
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
    console.log("list groupNames bổ sung", this.groupNames);
  }

  onChangePolicyNames(event: any[]) {
    this.policyNames.clear();
    event.forEach((e) => {
      this.policyNames.add(e);
    });
    console.log("list policyNames bổ sung", this.policyNames);
  }

  addPolicies(): void {
    //thêm groups, policies cũ của user
    this.userDetail.userPolicies.forEach((e) => {
      this.policyNames.add(e);
    });
    this.groupNames = this.groupNames.concat(this.userDetail.userGroups);
    
    this.userUpdate.userName = this.userDetail.userName;
    this.userUpdate.email = this.userDetail.email;
    this.userUpdate.groupNames = this.groupNames;
    this.userUpdate.policyNames = Array.from(this.policyNames);
    console.log('user update', this.userUpdate);
    this.service
      .createOrUpdate(this.userUpdate)
      .pipe(
        finalize(() => {
          this.loadingSrv.close();
        })
      )
      .subscribe(
        (data: any) => {
          console.log(data);
          this.message.success('Cập nhật User thành công');
          this.navigateToDetail();
        },
        (error) => {
          console.log(error.error);
          this.message.error('Cập nhật User không thành công');
        }
      );
  }

  navigateToDetail() {
    this.router.navigate(['/app-smart-cloud/users/detail/' + this.userName]);
  }
}
