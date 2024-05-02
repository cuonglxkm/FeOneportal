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
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef,
    private loadingSrv: LoadingService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {}

  ngOnInit(): void {
    this.service.model.subscribe((data) => {
      console.log(data);
    });
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

  //Router
  navigateToCreate() {}

  navigateToList() {
    this.router.navigate(['/app-smart-cloud/users']);
  }
}
