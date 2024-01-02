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
import { UserGroup } from 'src/app/shared/models/user.model';

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
  searchParam: string;
  loading = true;
  typePolicy: string = '';
  checkedAllInPage = false;

  constructor(
    private service: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userName = this.activatedRoute.snapshot.paramMap.get('userName');
    this.getGroup();
  }

  // Danh sách Groups
  getGroup(): void {
    this.listGroupPicked = [];
    this.groupNames = [];
    this.policyNames.clear();
    this.listCheckedGroupInPage = [];
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
    this.getGroup();
  }

  listGroupPicked: any[] = [];
  groupNames = [];
  policyNames = new Set<string>();
  onClickGroupItem(groupName: string, item: any) {
    var index = 0;
    var isAdded = true;
    this.groupNames.forEach((e) => {
      if (e == groupName) {
        this.groupNames.splice(index, 1);
        this.listGroupPicked.splice(index, 1);
        isAdded = false;
      }
      index++;
    });
    if (isAdded) {
      this.groupNames.push(groupName);
      this.listGroupPicked.push(item);
    }

    this.policyNames.clear();
    this.listGroupPicked.forEach((e) => {
      e.attachedPolicies.forEach((element) => {
        this.policyNames.add(element);
      });
    });

    if (this.listGroupPicked.length == this.listOfGroups.length) {
      this.checkedAllInPage = true;
    } else {
      this.checkedAllInPage = false;
    }

    console.log('list groupNames', this.groupNames);
    console.log('list policyNames', this.policyNames);
  }

  listCheckedGroupInPage = [];
  onChangeCheckAllGroup(checked: any) {
    let listChecked = [];
    this.listOfGroups.forEach(() => {
      listChecked.push(checked);
    });
    this.listCheckedGroupInPage = listChecked;
    if (checked == true) {
      this.listGroupPicked = [];
      this.listOfGroups.forEach((e) => {
        this.listGroupPicked.push(e);
      });
    } else {
      this.listGroupPicked = [];
    }
    this.groupNames = [];
    this.policyNames.clear();
    this.listGroupPicked.forEach((e) => {
      this.groupNames.push(e.name);
      e.attachedPolicies.forEach((element) => {
        this.policyNames.add(element);
      });
    });

    console.log('list groupNames', this.groupNames);
    console.log('list policyNames', this.policyNames);
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

  addToGroups() {}

  navigateToCreate() {}

  navigateToDetail() {
    this.router.navigate(['/app-smart-cloud/users/detail/' + this.userName]);
  }
}
