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
} from 'src/app/shared/models/user.model';
import { UserService } from 'src/app/shared/services/user.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'one-portal-add-to-group',
  templateUrl: './add-to-group.component.html',
  styleUrls: ['./add-to-group.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddToGroupComponent implements OnInit {
  regionId: number;
  projectId: number;
  listOfGroups: GroupCreateUser[] = [];
  pageIndex = 1;
  pageSize = 10;
  total: number = 3;
  id: any;
  searchParam: string;
  loading = true;
  typePolicy: string = '';

  constructor(
    private service: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.getData();
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

  reloadGroupTable() {
    this.listOfGroups = [];
    this.getData();
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
    this.router.navigate(['/app-smart-cloud/users/detail/' +this.id]);
  }
}
