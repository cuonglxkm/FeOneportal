import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RegionModel } from 'src/app/shared/models/region.model';
import {
  GroupCreateUser,
  PoliciesOfUser,
  User,
} from 'src/app/shared/models/user.model';
import { UserService } from 'src/app/shared/services/user.service';
import { finalize } from 'rxjs';
import { te } from 'date-fns/locale';

@Component({
  selector: 'one-portal-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['../user.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailComponent implements OnInit {
  user: User;
  regionId: number;
  projectId: number;
  listOfGroups: GroupCreateUser[] = [];
  listOfPolicies: PoliciesOfUser[] = [];
  pageIndex = 1;
  pageSize = 10;
  total: number = 3;
  userName: any;
  searchParam: string;
  loading = true;
  typePolicy: string = '';

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
    let test = new User();
    test.userName = 'nguyen';
    test.email = 'nguyen@gmail.com';
    test.userGroups = ['dkfjaldk'];
    test.createdDate = '2023-11-20T01:34:12.367Z';
    this.user = test;
    this.userName = this.activatedRoute.snapshot.paramMap.get('userName');
    this.getGroup();
    this.getPolicies();
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

  //Danh sách Policies
  getPolicies() {
    this.listPolicyPicked = [];
    this.listCheckedPolicyInPage = [];
    this.checkedAllPolicyInPage = false;
    this.service
      .getPoliciesOfUser()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((data) => {
        this.listOfPolicies = data.records;
      });
    console.log('list policy picked', this.listPolicyPicked);
  }

  reloadPolicies() {
    this.listOfPolicies = [];
    this.getPolicies();
  }

  listPolicyPicked = [];
  onClickPolicyItem(policyName: string) {
    var index = 0;
    var isAdded = true;
    this.listPolicyPicked.forEach((e) => {
      if (e == policyName) {
        this.listPolicyPicked.splice(index, 1);
        isAdded = false;
      }
      index++;
    });
    if (isAdded) {
      this.listPolicyPicked.push(policyName);
    }

    if (this.listPolicyPicked.length == this.listOfPolicies.length) {
      this.checkedAllPolicyInPage = true;
    } else {
      this.checkedAllPolicyInPage = false;
    }
    console.log('list policy picked', this.listPolicyPicked);
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
      this.listPolicyPicked = [];
      this.listOfPolicies.forEach((e) => {
        this.listPolicyPicked.push(e.name);
      });
    } else {
      this.listPolicyPicked = [];
    }
    console.log('list policy picked', this.listPolicyPicked);
  }

  // Danh sách Groups
  getGroup(): void {
    this.listGroupPicked = [];
    this.listCheckedGroupInPage = [];
    this.checkedAllGroupInPage = false;
    this.service
      .getGroupsCreateUser()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((baseResponse) => {
        this.listOfGroups = baseResponse.records;
        console.log(this.listOfGroups);
      });

    console.log('list group picked', this.listGroupPicked);
  }

  reloadGroupOfUser() {
    this.listOfGroups = [];
    this.getGroup();
  }

  listGroupPicked = [];
  onClickGroupItem(groupName: string) {
    var index = 0;
    var isAdded = true;
    this.listGroupPicked.forEach((e) => {
      if (e == groupName) {
        this.listGroupPicked.splice(index, 1);
        isAdded = false;
      }
      index++;
    });
    if (isAdded) {
      this.listGroupPicked.push(groupName);
    }

    if (this.listGroupPicked.length == this.listOfGroups.length) {
      this.checkedAllGroupInPage = true;
    } else {
      this.checkedAllGroupInPage = false;
    }

    console.log('list group picked', this.listGroupPicked);
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
      this.listGroupPicked = [];
      this.listOfGroups.forEach((e) => {
        this.listGroupPicked.push(e.name);
      });
    } else {
      this.listGroupPicked = [];
    }
    console.log('list group picked', this.listGroupPicked);
    this.cdr.detectChanges();
  }

  deletePolicies() {}
  deleteGroups() {}

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
