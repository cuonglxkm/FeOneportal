import {Component, EventEmitter, Inject, Input, Output} from '@angular/core';
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {UserGroupService} from "../../../../shared/services/user-group.service";
import {Router} from "@angular/router";
import {FormUserGroup, UserGroupModel} from "../../../../shared/models/user-group.model";
import {NzNotificationService} from "ng-zorro-antd/notification";
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';

@Component({
  selector: 'one-portal-extend-user-group',
  templateUrl: './edit-user-group.component.html',
  styleUrls: ['./edit-user-group.component.less'],
})
export class EditUserGroupComponent {
  @Input() isVisible: boolean
  @Input() isLoading: boolean
  @Input() groupNameCurrent: string
  //@Input() parent: string
  @Output() onCancel = new EventEmitter<void>()
  @Output() onOk = new EventEmitter<void>()
  @Output() groupNameNew: string

  value: string


  validateForm: FormGroup<{
    groupName: FormControl<string>;
  }> = this.fb.group({
    groupName: ['', [Validators.required, Validators.pattern(/^[\w\d+=,.@\-_]{1,128}$/), Validators.maxLength(128)]],

  });

  userGroup: UserGroupModel

  form: FormUserGroup = new FormUserGroup()

  constructor(private fb: NonNullableFormBuilder,
              private userGroupService: UserGroupService,
              private router: Router,
              private notification: NzNotificationService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {
  }

  handleCancel(): void {
    this.isVisible = false
    this.onCancel.emit();
  }

  handleOk(): void {
    this.submitForm()

  }

  onInputChange() {
    console.log('input change', this.value)
  }

  submitForm() {
    this.isLoading = true
    if (this.validateForm.valid) {
      this.form.groupName = this.validateForm.value.groupName
      //this.form.parentName = this.parent
      this.userGroupService.createOrEdit(this.form).subscribe(data => {
        this.userGroup = data
        this.isLoading = false
        this.notification.success(this.i18n.fanyi("app.status.success"), this.i18n.fanyi("app.user-group.edit.noti.sucess"))
        this.router.navigate(['/app-smart-cloud/iam/user-group/', this.userGroup.name])
        this.validateForm.reset()
        this.onOk.emit();
      }, error => {
        this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.user-group.edit.noti.fail"))
        this.isLoading = false
        this.validateForm.reset()
      })
    }
  }
}
