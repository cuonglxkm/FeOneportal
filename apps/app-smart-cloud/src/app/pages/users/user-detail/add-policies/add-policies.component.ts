import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RegionModel } from 'src/app/shared/models/region.model';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { UserService } from 'src/app/shared/services/user.service';
import { User } from 'src/app/shared/models/user.model';
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
  user: User;
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
      this.user = data;
      this.user.userPolicies.forEach((e) => {
        this.policyNames.add(e);
      });
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
    this.groupNames = [];
    this.groupNames = event.concat(this.user.userGroups);
  }

  onChangePolicyNames(event: any[]) {
    event.forEach((e) => {
      this.policyNames.add(e);
    });
  }

  addPolicies() {
    this.user.userGroups = this.groupNames;
    this.user.userPolicies = Array.from(this.policyNames);
    console.log("user update", this.user);
    this.service
    .createOrUpdate(this.user)
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
