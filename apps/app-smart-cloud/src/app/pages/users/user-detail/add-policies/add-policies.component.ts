import { ChangeDetectionStrategy, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/shared/services/user.service';
import { UserCreate, User } from 'src/app/shared/models/user.model';
import { finalize } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LoadingService } from '@delon/abc/loading';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { RegionModel, ProjectModel } from '../../../../../../../../libs/common-utils/src';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';

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
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  constructor(
    private service: UserService,
    private router: Router,
    private notification: NzNotificationService,
    private activatedRoute: ActivatedRoute,
    private loadingSrv: LoadingService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
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
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    // this.getSshKeys();
  }

  onRegionChanged(region: RegionModel) {
    this.regionId = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.projectId = project.id;
    // this.getSshKeys();
  }

  onChangeGroupNames(event: any[]) {
    this.groupNames = event;
    console.log('list groupNames bổ sung', this.groupNames);
  }

  onChangePolicyNames(event: any[]) {
    this.policyNames.clear();
    event.forEach((e) => {
      this.policyNames.add(e);
    });
    console.log('list policyNames bổ sung', this.policyNames);
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
          this.notification.success(this.i18n.fanyi("app.status.success"), this.i18n.fanyi("app.edit-user.noti.success"));
          this.navigateToDetail();
        },
        (e) => {
          this.notification.error(
            this.i18n.fanyi("app.status.fail"),
            this.i18n.fanyi("app.edit-user.noti.fail")
          );
        }
      );
  }

  navigateToDetail() {
    this.router.navigate(['/app-smart-cloud/users/detail/' + this.userName]);
  }
}
