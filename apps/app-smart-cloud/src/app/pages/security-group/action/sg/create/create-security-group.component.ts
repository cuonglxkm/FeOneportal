import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { SecurityGroupService } from '../../../../../shared/services/security-group.service';
import { AppValidator } from '../../../../../../../../../libs/common-utils/src';
import { FormCreateSG, SecurityGroupSearchCondition } from '../../../../../shared/models/security-group';

@Component({
  selector: 'one-portal-create-security-group',
  templateUrl: './create-security-group.component.html',
  styleUrls: ['./create-security-group.component.less'],
})
export class CreateSecurityGroupComponent implements AfterViewInit{
  @Input() region: number
  @Input() project: number
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()



  isVisible: boolean = false
  isLoading: boolean = false

  validateForm: FormGroup<{
    name: FormControl<string>;
    description: FormControl<string>;
  }> = this.fb.group({
    name: ['SG_', [Validators.required,
      Validators.maxLength(50),
      Validators.pattern(/^[a-zA-Z0-9_]*$/),
      AppValidator.startsWithValidator('SG_'),
      this.duplicateNameValidator.bind(this)]],
    description: ['', [Validators.maxLength(255)]]
  });

  nameList: string[] = [];

  @ViewChild('sgInputName') sgInputName!: ElementRef<HTMLInputElement>;

  constructor(private fb: NonNullableFormBuilder,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private securityGroupService: SecurityGroupService) {
  }

  duplicateNameValidator(control) {
    const value = control.value;
    // Check if the input name is already in the list
    if (this.nameList && this.nameList.includes(value)) {
      return { duplicateName: true }; // Duplicate name found
    } else {
      return null; // Name is unique
    }
  }

  getListSecurityGroup() {
    let formSearch = new SecurityGroupSearchCondition()
    formSearch.securityGroupId = null
    formSearch.userId = this.tokenService.get()?.userId
    formSearch.projectId = this.project
    formSearch.regionId = this.region

    this.securityGroupService.search(formSearch).subscribe(data => {
      data?.forEach(item => {
        this.nameList?.push(item?.name)
      })
    })
  }

  ngAfterViewInit(): void {
    this.sgInputName?.nativeElement.focus()
  }

  focusOkButton(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleOk();
    }
  }
  showModal() {
    this.getListSecurityGroup()
    this.isVisible = true
    setTimeout(() => {this.sgInputName?.nativeElement.focus()}, 1000)
  }

  handleCancel() {
    this.isVisible = false
    this.isLoading = false
    this.validateForm.reset()
    this.onCancel.emit()
  }
  handleOk() {
    this.isLoading = true
    if(this.validateForm.valid) {
      let formCreateSG = new FormCreateSG()
      formCreateSG.userId = this.tokenService.get()?.userId
      formCreateSG.name = this.validateForm.controls.name.value
      formCreateSG.description = this.validateForm.controls.description.value
      formCreateSG.regionId = this.region
      formCreateSG.projectId = this.project

      this.securityGroupService.createSecurityGroup(formCreateSG).subscribe(data => {
        this.isVisible = false
        this.isLoading = false
        this.notification.success("Thành công", "Tạo mới Security Group thành công")
        this.onOk.emit()
      }, error => {
        this.isVisible = false
        this.isLoading = false
        this.notification.error("Thất bại", "Tạo mới Security Group thất bại")
      })
    }
  }
}
