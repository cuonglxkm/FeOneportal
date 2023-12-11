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
  listOfpolicies: PoliciesOfUser[] = [];
  pageIndex = 1;
  pageSize = 10;
  total: number = 3;
  id: any;
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
    let test = new User()
    test.id = 5;
    test.name = 'nguyen';
    test.email = 'nguyen@gmail.com';
    test.groups = 2;
    test.createdTime = '2023-11-20T01:34:12.367Z';
    this.user = test;
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.getData();
    this.getPolicies();
  }

  getData(): void {
    // this.service.getData(this.ipAddress, this.status, this.customerId, this.regionId, this.isCheckState, this.size, this.index)
    //   .subscribe(baseResponse => {
    //   this.listOfIp = baseResponse.records;
    //     console.log(this.listOfIp);
    // });
    this.listGroupPicked = [];
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
  }

  reloadGroupOfUser() {
    this.listOfGroups = [];
    this.getData();
  }

  getPolicies() {
    this.listPolicyPicked = [];
    this.service
      .getPoliciesOfUser()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((data) => {
        this.listOfpolicies = data.records;
      });
  }

  reloadPolicies() {
    this.listOfpolicies = [];
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

  listPolicyPicked = [];
  onClickPolicyItem(policyName: string) {
    var index = 0;
    var isAdded = true;
    this.listPolicyPicked.forEach(e => {
      if (e == policyName) {
        this.listPolicyPicked.splice(index, 1);
        isAdded = false;
      }
      index++;
    });
    if (isAdded) {
      this.listPolicyPicked.push(policyName);
    }
    console.log("list policy picked", this.listPolicyPicked);
  }


  listGroupPicked = [];
  onClickGroupItem(groupName: string) {
    var index = 0;
    var isAdded = true;
    this.listGroupPicked.forEach(e => {
      if (e == groupName) {
        this.listGroupPicked.splice(index, 1);
        isAdded = false;
      }
      index++;
    });
    if (isAdded) {
      this.listGroupPicked.push(groupName);
    }
    console.log("list group picked", this.listGroupPicked);
  }

  deletePolicies() {}
  deleteGroups() {}

  navigateToAddPolicies() {
    this.router.navigate(['/app-smart-cloud/users/detail/' +this.id + '/add-policies']);
  }
  navigateToAddToGroups() {
    this.router.navigate(['/app-smart-cloud/users/detail/' +this.id + '/add-to-group']);
  }

  navigateToList() {
    this.router.navigate(['/app-smart-cloud/users']);
  }
}
