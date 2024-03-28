import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormDetailEndpointGroup, FormEditEndpointGroup } from 'src/app/shared/models/endpoint-group';
import { EndpointGroupService } from 'src/app/shared/services/endpoint-group.service';

@Component({
  selector: 'one-portal-edit-endpoint-group',
  templateUrl: './edit-endpoint-group.component.html',
  styleUrls: ['./edit-endpoint-group.component.less'],
})
export class EditEndpointGroupComponent{
  @Input() region: number
  @Input() project: number
  @Input() id: string
  @Input() name: string
  @Input() description: string
  @Input() type: string
  @Input() endpoints: string
  @Output() onOk = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false

  endpointGroup: FormDetailEndpointGroup = new FormDetailEndpointGroup()

  validateForm: FormGroup<{
    name: FormControl<string>
  }> = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9][a-zA-Z0-9-_ ]{0,254}$/)]]
  });

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private fb: NonNullableFormBuilder,
              private endpointGroupService: EndpointGroupService
              ) {
  }

  getEndpointGroupById(id) {
    this.isLoading = true;
    this.endpointGroupService
      .getEndpointGroupById(id, this.project, this.region)
      .subscribe(
        (data) => {
          this.endpointGroup = data;
          this.type = this.endpointGroup.type
          this.isLoading = false;
        },
        (error) => {
          this.endpointGroup = null;
          this.isLoading = false;
        }
      );
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
    let formEdit = new FormEditEndpointGroup()
    formEdit.id = this.id
    formEdit.regionId = this.region
    formEdit.vpcId = this.project
    formEdit.name = this.name
    formEdit.description = ''
    console.log(formEdit);
    
    if(this.validateForm.valid) {
      if(this.name.includes(this.validateForm.controls.name.value)){
        this.endpointGroupService.editEndpoinGroup(this.id, formEdit).subscribe(data => {
          if(data) {
            this.isVisible = false
            this.isLoading =  false
            this.notification.success('Thành công', 'Xoá Endpoint Group thành công')
            this.onOk.emit(data)
          }
        }, error => {
          this.isVisible = false
          this.isLoading =  false
          this.notification.error('Thất bại', 'Xoá Endpoint Group thất bại')
        })
      }
    }
  }

  ngOnInit(){
    this.getEndpointGroupById(this.id);
  }
  
}
