import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  DetachPoliciesOrGroups,
  ItemDetach,
  User,
  UserGroup,
} from 'src/app/shared/models/user.model';
import { UserService } from 'src/app/shared/services/user.service';
import { concatMap, finalize, from } from 'rxjs';
import { DatePipe } from '@angular/common';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { ClipboardService } from 'ngx-clipboard';
import { NzMessageService } from 'ng-zorro-antd/message';
import { RegionModel } from '../../../../../../../libs/common-utils/src';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { ProjectService } from '../../../shared/services/project.service';

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
  createdDate: string = '';

  filterStatus = [
    { text: this.i18n.fanyi('app.status.all'), value: '' },
    { text: this.i18n.fanyi('app.status.running'), value: 'KHOITAO' },
    { text: this.i18n.fanyi('app.status.suspended'), value: 'TAMNGUNG' },
  ];
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  changeFilterStatus(e: any): void {
    this.typePolicy = e;
  }

  constructor(
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private service: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef,
    private projectService: ProjectService,
    private clipboardService: ClipboardService,
    public message: NzMessageService
  ) {
    this.optionJsonEditor = new JsonEditorOptions();
    this.optionJsonEditor.mode = 'text';
  }

  ngOnInit(): void {
    this.userName = this.activatedRoute.snapshot.paramMap.get('userName');
    this.getUserByUserName();
  }

  listProjectName: string[] = []
  listProjectNameStr: string = ''
  getUserByUserName() {
    this.listGroupNames = [];
    this.listPolicyNames = [];
    this.service.getUserByUsername(this.userName).subscribe((data: any) => {
      this.user = data;
      data.projectIds?.forEach(item => {
        this.projectService.getByProjectId(item).subscribe(data2 => {
          this.listProjectName?.push(data2?.cloudProject?.displayName)
          this.listProjectNameStr = this.listProjectName.join(', ')
        })
      })
      this.createdDate = this.datePipe.transform(
        this.user.createdDate,
        'HH:mm:ss dd/MM/yyyy'
      );
      console.log('user detail', this.user);
      this.listGroupNames = this.user.userGroups;
      this.listGroupNames = this.listGroupNames.filter((e) => e != '');
      this.listPolicyNames = this.user.userPolicies;
      this.listPolicyNames = this.listPolicyNames.filter((e) => e != '');
      this.getGroup();
      this.getPolicies();
      this.cdr.detectChanges()
    });
  }

  onRegionChange(region: RegionModel) {
    // Handle the region change event
    this.regionId = region.regionId;
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.cdr.detectChanges();
  }

  onRegionChanged(region: RegionModel) {
    this.regionId = region.regionId;
  }

  onProjectChange(project: any) {
    // Handle the region change event
    this.projectId = project.id;
    this.cdr.detectChanges();
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
    this.setOfCheckedPolicy.clear();
    this.listItemDetachPolicy = [];
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
    this.checkedPolicy = listOfEnabledData?.every(({ name }) =>
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
    if (this.listItemDetachPolicy.length != 0) {
      this.service.detachPoliciesOrGroups(detachPolicy).subscribe(() => {
        this.getUserByUserName();
      });
    }
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
    this.setOfCheckedGroup.clear();
    this.listItemDetachGroup = [];
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
    if (this.listItemDetachGroup.length != 0) {
      this.service.detachPoliciesOrGroups(detachGroup).subscribe(() => {
        this.getUserByUserName();
      });
    }
  }

  // View Json Object
  @ViewChild(JsonEditorComponent) editor: JsonEditorComponent;
  public optionJsonEditor: JsonEditorOptions;
  expandSet = new Set<string>();
  onExpandChange(name: string, checked: boolean): void {
    if (checked) {
      this.expandSet.add(name);
    } else {
      this.expandSet.delete(name);
    }
  }

  copyText(data: any) {
    this.clipboardService.copyFromContent(JSON.stringify(data));
    this.message.success('Copied to clipboard');
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
