import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RegionModel } from 'src/app/shared/models/region.model';
import {
  CopyUserPolicies,
  GroupCreateUser,
  PermissionPolicies,
} from 'src/app/shared/models/user.model';
import { UserService } from 'src/app/shared/services/user.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'one-portal-add-policies',
  templateUrl: './add-policies.component.html',
  styleUrls: ['./add-policies.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPoliciesComponent implements OnInit {
  regionId: number;
  projectId: number;
  listOfGroups: GroupCreateUser[] = [];
  listOfUsers: CopyUserPolicies[] = [];
  listOfpolicies: PermissionPolicies[] = [];
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
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.getData();
    this.getCopyUserPlicies();
    this.getPermissionPolicies();
  }

  getData(): void {
    // this.service.getData(this.ipAddress, this.status, this.customerId, this.regionId, this.isCheckState, this.size, this.index)
    //   .subscribe(baseResponse => {
    //   this.listOfIp = baseResponse.records;
    //     console.log(this.listOfIp);
    // });
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

  getCopyUserPlicies() {
    this.service
      .getCopyUserPolicies()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((data) => {
        this.listOfUsers = data.records;
      });
  }

  getPermissionPolicies() {
    this.service
      .getPermissionPolicies()
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

  activeBlockAddUsertoGroup: boolean = true;
  activeBlockCopyPolicies: boolean = false;
  activeBlockAttachPolicies: boolean = false;

  initAddUsertoGroup(): void {
    this.activeBlockAddUsertoGroup = true;
    this.activeBlockCopyPolicies = false;
    this.activeBlockAttachPolicies = false;
  }
  initCopyPolicies(): void {
    this.activeBlockAddUsertoGroup = false;
    this.activeBlockCopyPolicies = true;
    this.activeBlockAttachPolicies = false;
  }
  initAttachPolicies(): void {
    this.activeBlockAddUsertoGroup = false;
    this.activeBlockCopyPolicies = false;
    this.activeBlockAttachPolicies = true;
  }

  navigateToCreate() {}

  navigateToDetail() {
    this.router.navigate(['/app-smart-cloud/users/detail/' +this.id]);
  }
}