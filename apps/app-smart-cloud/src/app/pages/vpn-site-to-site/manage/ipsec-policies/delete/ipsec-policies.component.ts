import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormDeleteIpsecPolicy } from 'src/app/shared/models/ipsec-policy';
import { IpsecPolicyService } from 'src/app/shared/services/ipsec-policy.service';


@Component({
  selector: 'one-portal-delete-ipsec-policies',
  templateUrl: './ipsec-policies.component.html',
  styleUrls: ['./ipsec-policies.component.less'],
})
export class DeleteIpsecPoliciesComponent{
  @Input() region; number
  @Input() project: number
  @Input() ipsecpolicyid: string
  @Input() nameIpsecPolicy: string
  @Output() onOk = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false

  validateForm: FormGroup<{
    name: FormControl<string>
  }> = this.fb.group({
    name: ['', [Validators.required, this.nameIpsecPolicyValidator.bind(this)]]
  });

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private fb: NonNullableFormBuilder,
              private ipsecPolicyService: IpsecPolicyService
              ) {
  }

  nameIpsecPolicyValidator(control: FormControl): { [key: string]: any } | null {
    const name = control.value;
    if (name !== this.nameIpsecPolicy) {
      return { 'nameMismatch': true };
    }
    return null;
  }

  showModal(){
    this.isVisible = true
  }

  handleCancel(){
    this.isVisible = false
    this.isLoading =  false
  }

  handleOk() {
    this.isLoading = true
    let formDelete = new FormDeleteIpsecPolicy()
    formDelete.id = this.ipsecpolicyid
    formDelete.regionId = this.region
    formDelete.vpcId = this.project
    console.log(formDelete);
    
    if(this.validateForm.valid) {
      if(this.nameIpsecPolicy.includes(this.validateForm.controls.name.value)){
        this.ipsecPolicyService.deleteIpsecPolicy(formDelete).subscribe(data => {
          if(data) {
            this.isVisible = false
            this.isLoading =  false
            this.notification.success('Thành công', 'Xoá Ipsec Policy thành công')
            this.onOk.emit(data)
          }
        }, error => {
          this.isVisible = false
          this.isLoading =  false
          this.notification.error('Thất bại', 'Xoá Ipsec Policy thất bại')
        })
      }
    }
  }

  
}
