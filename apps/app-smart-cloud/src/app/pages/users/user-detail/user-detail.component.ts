import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RegionModel } from 'src/app/shared/models/region.model';
import {
  DetachPoliciesOrGroups,
  ItemDetach,
  User,
  UserGroup,
} from 'src/app/shared/models/user.model';
import { UserService } from 'src/app/shared/services/user.service';
import { concatMap, finalize, from } from 'rxjs';

@Component({
  selector: 'one-portal-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['../user.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailComponent implements OnInit {
  user: User = new User();
  regionId: number;
  projectId: number;
  listOfGroups: UserGroup[] = [];
  listOfPolicies: any[] = [];
  listGroupNames: string[] = [];
  listPolicyNames: string[] = [];
  userName: any;
  policyParam: string = '';
  groupParam: string = '';
  typePolicy: string = '';
  loading: boolean = true;

  filterStatus = [
    { text: 'Tất cả các loại', value: '' },
    { text: 'Khởi tạo', value: 'KHOITAO' },
    { text: 'Hủy', value: 'HUY' },
    { text: 'Tạm ngưng', value: 'TAMNGUNG' },
  ];

  changeFilterStatus(e: any): void {
    this.typePolicy = e;
  }

  constructor(
    private service: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userName = this.activatedRoute.snapshot.paramMap.get('userName');
    this.getUserByUserName();
  }

  getUserByUserName() {
    this.listGroupNames = [];
    this.listPolicyNames = [];
    this.service.getUserByUsername(this.userName).subscribe((data: any) => {
      this.user = data;
      console.log('user detail', this.user);
      this.listGroupNames = this.user.userGroups;
      this.listGroupNames = this.listGroupNames.filter((e) => e != '');
      this.listPolicyNames = this.user.userPolicies;
      this.listPolicyNames = this.listPolicyNames.filter((e) => e != '');
      this.getGroup();
      this.getPolicies();
    });
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

  changePolicyParam(e: any): void {
    this.policyParam = e;
  }

  changeGroupParam(e: any): void {
    this.groupParam = e;
  }

  //Danh sách Policies
  getPolicies() {
    this.loading = true;
    this.listOfPolicies = [];
    from(this.listPolicyNames)
      .pipe(concatMap((e) => this.service.getPolicy(e)))
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((result) => {
        if (result.name != null && result.name != undefined) {
          this.listOfPolicies = this.listOfPolicies.concat([result]);
        }
        this.cdr.detectChanges();
      });

    console.log('Policies of user', this.listOfPolicies);
  }

  reloadPolicies() {
    this.isReload = true;
    this.getPolicies();
    setTimeout(() => {
      this.isReload = false;
      this.cdr.detectChanges();
    }, 1500);
  }

  searchPolicy() {
    this.loading = true;
    this.listOfPolicies = [];
    from(this.listPolicyNames)
      .pipe(concatMap((e) => this.service.getPolicy(e)))
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((result) => {
        if (
          result.name.toLowerCase().includes(this.policyParam.toLowerCase())
        ) {
          this.listOfPolicies = this.listOfPolicies.concat([result]);
        }
        this.cdr.detectChanges();
      });
  }

  listItemDetachPolicy: ItemDetach[] = [];
  checkedPolicy = false;
  indeterminatePolicy = false;
  setOfCheckedPolicy = new Set<string>();

  onCurrentPageDataChangePolicy(listOfCurrentPageData: any[]): void {
    this.listOfPolicies = listOfCurrentPageData;
    this.refreshCheckedStatusPolicy();
  }

  refreshCheckedStatusPolicy(): void {
    const listOfEnabledData = this.listOfPolicies;
    this.checkedPolicy = listOfEnabledData.every(({ name }) =>
      this.setOfCheckedPolicy.has(name)
    );
    this.indeterminatePolicy =
      listOfEnabledData.some(({ name }) => this.setOfCheckedPolicy.has(name)) &&
      !this.checkedPolicy;
  }

  updateCheckedSetPolicy(name: string, checked: boolean): void {
    if (checked) {
      this.setOfCheckedPolicy.add(name);
    } else {
      this.setOfCheckedPolicy.delete(name);
    }
  }

  onItemCheckedPolicy(name: string, checked: boolean): void {
    this.updateCheckedSetPolicy(name, checked);
    this.refreshCheckedStatusPolicy();
  }

  onAllCheckedPolicy(checked: boolean): void {
    this.listOfPolicies.forEach(({ name }) =>
      this.updateCheckedSetPolicy(name, checked)
    );
    this.refreshCheckedStatusPolicy();
  }

  deletePolicies() {
    this.setOfCheckedPolicy.forEach((e) => {
      var itemDetach: ItemDetach = new ItemDetach();
      itemDetach.itemName = e;
      itemDetach.type = 2;
      this.listItemDetachPolicy.push(itemDetach);
    });
    var detachPolicy: DetachPoliciesOrGroups = new DetachPoliciesOrGroups();
    detachPolicy.userName = this.userName;
    detachPolicy.items = this.listItemDetachPolicy;
    this.service.detachPoliciesOrGroups(detachPolicy).subscribe(() => {
      this.getUserByUserName();
    });
  }

  // Danh sách Groups
  getGroup(): void {
    this.loading = true;
    this.listOfGroups = [];
    from(this.listGroupNames)
      .pipe(concatMap((e) => this.service.getGroup(e)))
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((result) => {
        if (result.name != null && result.name != undefined) {
          this.listOfGroups = this.listOfGroups.concat([result]);
          this.service
            .getUsersOfGroup(result.name, 9999, 1)
            .subscribe((data: any) => {
              result.numberOfUser = data.totalCount;
              this.cdr.detectChanges();
            });
        }
        this.cdr.detectChanges();
      });
    console.log('groups of user', this.listOfGroups);
  }

  isReload = false;
  reloadGroupOfUser() {
    this.isReload = true;
    this.getGroup();
    setTimeout(() => {
      this.isReload = false;
      this.cdr.detectChanges();
    }, 1500);
  }

  searchGroup() {
    this.loading = true;
    this.listOfGroups = [];
    from(this.listGroupNames)
      .pipe(concatMap((e) => this.service.getGroup(e)))
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((result) => {
        if (result.name.toLowerCase().includes(this.groupParam.toLowerCase())) {
          this.listOfGroups = this.listOfGroups.concat([result]);
          this.service
            .getUsersOfGroup(result.name, 9999, 1)
            .subscribe((data: any) => {
              result.numberOfUser = data.totalCount;
            });
          this.cdr.detectChanges();
        }
      });
  }

  listItemDetachGroup: ItemDetach[] = [];
  checkedGroup = false;
  indeterminateGroup = false;
  setOfCheckedGroup = new Set<string>();

  onCurrentPageDataChangeGroup(listOfCurrentPageData: UserGroup[]): void {
    this.listOfGroups = listOfCurrentPageData;
    this.refreshCheckedStatusGroup();
  }

  refreshCheckedStatusGroup(): void {
    const listOfEnabledData = this.listOfGroups;
    this.checkedGroup = listOfEnabledData.every(({ name }) =>
      this.setOfCheckedGroup.has(name)
    );
    this.indeterminateGroup =
      listOfEnabledData.some(({ name }) => this.setOfCheckedGroup.has(name)) &&
      !this.checkedGroup;
  }

  updateCheckedSetGroup(name: string, checked: boolean): void {
    if (checked) {
      this.setOfCheckedGroup.add(name);
    } else {
      this.setOfCheckedGroup.delete(name);
    }
  }

  onItemCheckedGroup(name: string, checked: boolean): void {
    this.updateCheckedSetGroup(name, checked);
    this.refreshCheckedStatusGroup();
  }

  onAllCheckedGroup(checked: boolean): void {
    this.listOfGroups.forEach(({ name }) =>
      this.updateCheckedSetGroup(name, checked)
    );
    this.refreshCheckedStatusGroup();
  }

  deleteGroups() {
    this.setOfCheckedGroup.forEach((e) => {
      var itemDetach: ItemDetach = new ItemDetach();
      itemDetach.itemName = e;
      itemDetach.type = 1;
      this.listItemDetachGroup.push(itemDetach);
    });
    var detachGroup: DetachPoliciesOrGroups = new DetachPoliciesOrGroups();
    detachGroup.userName = this.userName;
    detachGroup.items = this.listItemDetachGroup;
    this.service.detachPoliciesOrGroups(detachGroup).subscribe(() => {
      this.getUserByUserName();
    });
  }

  navigateToAddPolicies() {
    this.router.navigate([
      '/app-smart-cloud/users/detail/' + this.userName + '/add-policies',
    ]);
  }
  navigateToAddToGroups() {
    this.router.navigate([
      '/app-smart-cloud/users/detail/' + this.userName + '/add-to-group',
    ]);
  }

  navigateToList() {
    this.router.navigate(['/app-smart-cloud/users']);
  }
}
