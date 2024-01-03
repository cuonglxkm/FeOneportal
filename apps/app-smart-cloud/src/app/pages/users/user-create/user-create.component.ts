import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { RegionModel } from 'src/app/shared/models/region.model';
import { UserCreate } from 'src/app/shared/models/user.model';
import { UserService } from 'src/app/shared/services/user.service';
import { finalize } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LoadingService } from '@delon/abc/loading';
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

  form: FormGroup<{
    name: FormControl<string>;
    email: FormControl<string>;
  }> = this.fb.group({
    name: [
      '',
      [Validators.required, Validators.pattern(/^[\w\d+=,.@\-_]{1,64}$/)],
    ],
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(
    private fb: NonNullableFormBuilder,
    private service: UserService,
    private router: Router,
    public message: NzMessageService,
    private cdr: ChangeDetectorRef,
    private loadingSrv: LoadingService
  ) {}

  ngOnInit(): void {
    this.service.model.subscribe((data) => {
      console.log(data);
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
    this.userCreate.groupNames = this.groupNames;
    this.userCreate.policyNames = this.policyNames;
    this.isVisibleCreate = false;
    console.log("user create", this.userCreate);
    this.service
      .createOrUpdate(this.userCreate)
      .pipe(
        finalize(() => {
          this.loadingSrv.close();
        })
      )
      .subscribe(
        (data: any) => {
          console.log(data);
          this.message.success('Tạo mới User thành công');
          this.router.navigateByUrl(`/app-smart-cloud/users`);
        },
        (error) => {
          console.log(error.error);
          this.message.error('Tạo mới User không thành công');
        }
      );
  }

  //Router
  navigateToCreate() {}

  navigateToList() {
    this.router.navigate(['/app-smart-cloud/users']);
  }
}
