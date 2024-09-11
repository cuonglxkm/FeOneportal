import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { UserCreate } from 'src/app/shared/models/user.model';
import { UserService } from 'src/app/shared/services/user.service';
import { finalize } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LoadingService } from '@delon/abc/loading';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { ProjectModel } from '../../../../../../../libs/common-utils/src';
import { ProjectService } from '../../../shared/services/project.service';
import { RegionService } from '../../../shared/services/region.service';
@Component({
  selector: 'one-portal-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['../user.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCreateComponent implements OnInit {
  userCreate: UserCreate = new UserCreate();
  regionId: number;
  projectId: number;
  id: any;
  searchParam: string;
  loading = true;
  groupNames: any[] = [];
  policyNames: any[] = [];

  listProject: ProjectModel[] = [];
  listProjectSelected: number[];

  form: FormGroup<{
    name: FormControl<string>;
    email: FormControl<string>;
    projectIds: FormControl<number[]>
  }> = this.fb.group({
    name: [
      '',
      [Validators.required, Validators.pattern(/^[\w\d+=,.@\-_]{1,64}$/)],
    ],
    email: ['', [Validators.required, Validators.email]],
    projectIds: [null as number[] | null, Validators.required]
  });

  constructor(
    private fb: NonNullableFormBuilder,
    private service: UserService,
    private router: Router,
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef,
    private loadingSrv: LoadingService,
    private projectService: ProjectService,
    private regionService: RegionService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {}

  ngOnInit(): void {
    this.service.model.subscribe((data) => {
      console.log(data);
    });
    this.getListProject();
  }

  onChangeGroupNames(event: any[]) {
    this.groupNames = event;
  }

  onChangePolicyNames(event: any[]) {
    this.policyNames = event;
  }

  //Tạo User
  isVisibleCreate: boolean = false;
  showModal() {
    console.log('listGroupNames Create', this.groupNames);
    console.log('listPolicyNames Create', this.policyNames);
    this.isVisibleCreate = true;
  }

  handleCancelCreate() {
    this.isVisibleCreate = false;
  }

  handleOkCreate(): void {
    const submitSelectedProject = this.listProjectSelected.length === this.listProject.length ? [0] : this.listProjectSelected
    this.userCreate.groupNames = this.groupNames;
    this.userCreate.policyNames = this.policyNames;
    this.userCreate.projectIds = submitSelectedProject;
    this.isVisibleCreate = false;
    console.log('user create', this.userCreate);
    this.service
      .createOrUpdate(this.userCreate)
      .pipe(
        finalize(() => {
          this.loadingSrv.close();
        })
      )
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.notification.success(this.i18n.fanyi("app.status.success"), this.i18n.fanyi("app.create-user.noti.success"));
          this.navigateToList();
        },
        error: (e) => {
          this.notification.error(
            this.i18n.fanyi("app.status.fail"),
            this.i18n.fanyi("app.create-user.noti.fail")
          );
        },
      });
  }

  //Lấy danh sách project
  isLoadingProject: boolean = true;
  getListProject() {
    this.listProject = [];
    this.isLoadingProject = true;
    this.regionService.getListRegions().subscribe(data => {
      this.isLoadingProject = false;
      data.forEach(item => {
        this.projectService.getByRegion(item.regionId).subscribe(data2 => {
          data2.forEach(project => {
            this.listProject?.push(project);
          });
        }, error => {
          this.isLoadingProject = false;
          this.notification.error(error.statusText, this.i18n.fanyi('app.failData'));
        });
      }, error => {
        this.listProject = [];
        this.isLoadingProject = false;
        this.notification.error(error.statusText, this.i18n.fanyi('app.failData'));
      });
    });
  }

  onSelectedProject(value: number[]) {
    console.log('value', value)
    if(value.includes(0)){
      return this.selectAllOptions()
    }
    this.listProjectSelected = value;
  }

  selectAllOptions(){
    const filterSelectAllOption = this.listProjectSelected.filter(project => project !== 0)
    if(filterSelectAllOption.length === this.listProject.length){
      this.listProjectSelected = []
    }else{
      this.listProjectSelected = this.listProject.map(project => project.id)
    }
  }

  //Router
  navigateToCreate() {}

  navigateToList() {
    this.router.navigate(['/app-smart-cloud/users']);
  }
}
