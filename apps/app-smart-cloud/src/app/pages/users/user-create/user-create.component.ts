import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegionModel } from 'src/app/shared/models/region.model';
import { GroupCreateUser } from 'src/app/shared/models/user.model';
import { UserService } from 'src/app/shared/services/user.service';
import { BaseResponse } from '../../../../../../../libs/common-utils/src';
import { finalize } from 'rxjs';

@Component({
  selector: 'one-portal-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['../user.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCreateComponent implements OnInit {
  regionId: number;
  projectId: number;
  listOfGroups: GroupCreateUser[] = [];
  pageIndex = 1;
  pageSize = 10;
  total: number = 3;
  baseResponse: BaseResponse<GroupCreateUser[]>;
  id: any;
  searchParam: string;
  loading = true;

  form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor(
    private service: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.service.model.subscribe((data) => {
      console.log(data);
    });
    this.getData();
  }

  getData(): void {
    // this.service.getData(this.ipAddress, this.status, this.customerId, this.regionId, this.isCheckState, this.size, this.index)
    //   .subscribe(baseResponse => {
    //   this.listOfIp = baseResponse.records;
    //     console.log(this.listOfIp);
    // });
    this.service.getGroupsCreateUser().pipe(
      finalize(() => {
      this.loading = false;
      this.cdr.detectChanges();
    })
    ).subscribe(baseResponse => {
      this.listOfGroups = baseResponse.records;
        console.log(this.listOfGroups);
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
}
