import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {UserGroupService} from "../../../../shared/services/user-group.service";
import {Router} from "@angular/router";
import {FormEditUserGroup, UserGroupModel} from "../../../../shared/models/user-group.model";
import {NzNotificationService} from "ng-zorro-antd/notification";

@Component({
  selector: 'one-portal-edit-user-group',
  templateUrl: './edit-user-group.component.html',
  styleUrls: ['./edit-user-group.component.less'],
})
export class EditUserGroupComponent {
  @Input() isVisible: boolean
  @Input() isLoading: boolean
  @Input() groupNameCurrent: string
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

  formEdit: FormEditUserGroup = new FormEditUserGroup()

  constructor(private fb: NonNullableFormBuilder,
              private userGroupService: UserGroupService,
              private router: Router,
              private notification: NzNotificationService
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
    if(this.validateForm.valid) {
      this.formEdit.groupName = this.validateForm.value.groupName
      this.userGroupService.edit(this.groupNameCurrent, this.formEdit).subscribe(data => {
        this.userGroup = data
        this.isLoading = false
        this.notification.success('Thành công', 'Chỉnh sửa thông tin Group thành công')
        this.router.navigate(['/app-smart-cloud/iam/user-group/', this.userGroup.name])
        this.validateForm.reset()
        this.onOk.emit();
      }, error => {
        this.notification.error('Thất bại', 'Chỉnh sửa thông tin Group thất bại')
      })
    }
  }
}
