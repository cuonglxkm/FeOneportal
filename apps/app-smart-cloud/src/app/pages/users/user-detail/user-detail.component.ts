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
  listOfGroups: any[] = [];
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
    this.listItemDetachPolicy = [];
    this.listCheckedPolicyInPage = [];
    this.checkedAllPolicyInPage = false;
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
    this.getPolicies();
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
  onClickPolicyItem(policyName: string) {
    var index = 0;
    var isAdded = true;
    this.listItemDetachPolicy.forEach((e) => {
      if (e.itemName == policyName) {
        this.listItemDetachPolicy.splice(index, 1);
        isAdded = false;
      }
      index++;
    });
    if (isAdded) {
      var itemDetach: ItemDetach = new ItemDetach();
      itemDetach.itemName = policyName;
      itemDetach.type = 2;
      this.listItemDetachPolicy.push(itemDetach);
    }

    if (this.listItemDetachPolicy.length == this.listOfPolicies.length) {
      this.checkedAllPolicyInPage = true;
    } else {
      this.checkedAllPolicyInPage = false;
    }
    console.log('list detach policy picked', this.listItemDetachPolicy);
  }

  listCheckedPolicyInPage = [];
  checkedAllPolicyInPage = false;
  onChangeCheckAllPolicy(checked: any) {
    let listChecked = [];
    this.listOfPolicies.forEach(() => {
      listChecked.push(checked);
    });
    this.listCheckedPolicyInPage = listChecked;
    if (checked == true) {
      this.listItemDetachPolicy = [];
      this.listOfPolicies.forEach((e) => {
        var itemDetach: ItemDetach = new ItemDetach();
        itemDetach.itemName = e.name;
        itemDetach.type = 2;
        this.listItemDetachPolicy.push(itemDetach);
      });
    } else {
      this.listItemDetachPolicy = [];
    }
    console.log('list detach policy picked', this.listItemDetachPolicy);
  }

  deletePolicies() {
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
    this.listItemDetachGroup = [];
    this.listCheckedGroupInPage = [];
    this.checkedAllGroupInPage = false;
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
            });
        }
        this.cdr.detectChanges();
      });
    console.log('groups of user', this.listOfGroups);
  }

  reloadGroupOfUser() {
    this.getGroup();
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
  onClickGroupItem(groupName: string) {
    var index = 0;
    var isAdded = true;
    this.listItemDetachGroup.forEach((e) => {
      if (e.itemName == groupName) {
        this.listItemDetachGroup.splice(index, 1);
        isAdded = false;
      }
      index++;
    });
    if (isAdded) {
      var itemDetach: ItemDetach = new ItemDetach();
      itemDetach.itemName = groupName;
      itemDetach.type = 1;
      this.listItemDetachGroup.push(itemDetach);
    }

    if (this.listItemDetachGroup.length == this.listOfGroups.length) {
      this.checkedAllGroupInPage = true;
    } else {
      this.checkedAllGroupInPage = false;
    }

    console.log('list detach group picked', this.listItemDetachGroup);
  }

  listCheckedGroupInPage = [];
  checkedAllGroupInPage = false;
  onChangeCheckAllGroup(checked: any) {
    let listChecked = [];
    this.listOfGroups.forEach(() => {
      listChecked.push(checked);
    });
    this.listCheckedGroupInPage = listChecked;
    if (checked == true) {
      this.listItemDetachGroup = [];
      this.listOfGroups.forEach((e) => {
        var itemDetach: ItemDetach = new ItemDetach();
        itemDetach.itemName = e.name;
        itemDetach.type = 1;
        this.listItemDetachGroup.push(itemDetach);
      });
    } else {
      this.listItemDetachGroup = [];
    }
    console.log('list detach group picked', this.listItemDetachGroup);
    this.cdr.detectChanges();
  }

  deleteGroups() {
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
