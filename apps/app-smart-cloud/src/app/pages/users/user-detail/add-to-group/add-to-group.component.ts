import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RegionModel } from 'src/app/shared/models/region.model';
import { UserService } from 'src/app/shared/services/user.service';
import { finalize } from 'rxjs';
import { User, UserCreate, UserGroup } from 'src/app/shared/models/user.model';
import { LoadingService } from '@delon/abc/loading';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'one-portal-add-to-group',
  templateUrl: './add-to-group.component.html',
  styleUrls: ['./add-to-group.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddToGroupComponent implements OnInit {
  regionId: number;
  projectId: number;
  listOfGroups: UserGroup[] = [];
  pageIndex = 1;
  pageSize = 10;
  total: number;
  userName: any;
  userDetail: User;
  userUpdate: UserCreate = new UserCreate();
  searchParam: string;
  loading = true;
  typePolicy: string = '';
  checkedAllInPage = false;

  constructor(
    private service: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private notification: NzNotificationService,
    private loadingSrv: LoadingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userName = this.activatedRoute.snapshot.paramMap.get('userName');
    this.getGroup();
    this.getuserDetail();
  }
  getuserDetail() {
    this.service.getUserByUsername(this.userName).subscribe((data: any) => {
      this.userDetail = data;
    });
  }

  // Danh sách Groups
  getGroup(): void {
    this.loading = true;
    this.groupNames = [];
    this.policyNames.clear();
    this.checkedAllInPage = false;
    this.service
      .getGroups(this.searchParam, this.pageSize, this.pageIndex)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((data) => {
        this.total = data.totalCount;
        this.listOfGroups = data.records;
        this.listOfGroups.forEach((e) => {
          this.service
            .getUsersOfGroup(e.name, 9999, 1)
            .subscribe((data: any) => {
              e.numberOfUser = data.totalCount;
              data.records.forEach((user: any) => {
                if (user.userName == this.userName) {
                  this.listOfGroups = this.listOfGroups.filter(
                    (item) => item != e
                  );
                }
                this.cdr.detectChanges();
              });
            });
        });

        console.log(this.listOfGroups);
      });

    console.log('list groupNames', this.groupNames);
    console.log('list policyNames', this.policyNames);
  }

  reloadGroupTable(): void {
    this.listOfGroups = [];
    this.groupNames = [];
    this.mapOfCheckedGroup.clear();
    this.policyNames.clear();
    this.checkedGroup = false;
    this.indeterminateGroup = false;
    this.getGroup();
  }

  groupNames = [];
  policyNames = new Set<string>();
  checkedGroup = false;
  indeterminateGroup = false;
  mapOfCheckedGroup = new Map<string, string[]>();

  onCurrentPageDataChangeGroup(listOfCurrentPageData: UserGroup[]): void {
    this.listOfGroups = listOfCurrentPageData;
    this.refreshCheckedStatusGroup();
  }

  refreshCheckedStatusGroup(): void {
    const listOfEnabledData = this.listOfGroups;
    this.checkedGroup = listOfEnabledData.every(({ name }) =>
      this.mapOfCheckedGroup.has(name)
    );
    this.indeterminateGroup =
      listOfEnabledData.some(({ name }) => this.mapOfCheckedGroup.has(name)) &&
      !this.checkedGroup;
  }

  updateCheckedSetGroup(item: UserGroup, checked: boolean): void {
    if (checked) {
      this.mapOfCheckedGroup.set(item.name, item.policies);
    } else {
      this.mapOfCheckedGroup.delete(item.name);
    }
  }

  handleDataPicked() {
    this.groupNames = Array.from(this.mapOfCheckedGroup.keys());
    this.policyNames.clear();
    this.mapOfCheckedGroup.forEach((e) => {
      e.forEach((item) => {
        this.policyNames.add(item);
      });
    });
  }

  onItemCheckedGroup(item: UserGroup, checked: boolean): void {
    this.updateCheckedSetGroup(item, checked);
    this.handleDataPicked();
    this.refreshCheckedStatusGroup();
  }

  onAllCheckedGroup(checked: boolean): void {
    this.listOfGroups.forEach((item) =>
      this.updateCheckedSetGroup(item, checked)
    );
    this.handleDataPicked();
    this.refreshCheckedStatusGroup();
  }

  addToGroups() {
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
          this.notification.success('', 'Cập nhật User thành công');
          this.navigateToDetail();
        },
        (error) => {
          console.log(error.error);
          this.notification.error('', 'Cập nhật User không thành công');
        }
      );
  }

  onRegionChange(region: RegionModel) {
    // Handle the region change event
    this.regionId = region.regionId;
    this.cdr.detectChanges();
  }

  onProjectChange(project: any) {
    // Handle the region change event
    this.projectId = project.id;
    this.cdr.detectChanges();
  }

  changeSearch(e: any): void {
    this.searchParam = e;
  }

  navigateToCreateGroup() {
    this.router.navigate(['/app-smart-cloud/iam/user-group/create']);
  }

  navigateToDetail() {
    this.router.navigate(['/app-smart-cloud/users/detail/' + this.userName]);
  }
}
