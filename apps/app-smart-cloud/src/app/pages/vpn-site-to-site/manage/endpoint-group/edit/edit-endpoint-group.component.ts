import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { I18NService } from '@core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
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
  @Input() type: string
  @Input() endpoints: string
  @Output() onOk = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false

  endpointGroup: FormDetailEndpointGroup = new FormDetailEndpointGroup()

  validateForm: FormGroup<{
    nameEndpointGroup: FormControl<string>
    description: FormControl<string>
  }> = this.fb.group({
    nameEndpointGroup: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9][a-zA-Z0-9-_ ]{0,254}$/)]],
    description: ['', [Validators.pattern(/^[a-zA-Z0-9][a-zA-Z0-9-_ ]{0,254}$/)]]
  });

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private fb: NonNullableFormBuilder,
              private endpointGroupService: EndpointGroupService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
              ) {
  }

  getEndpointGroupById(id) {
    this.endpointGroupService
      .getEndpointGroupById(id, this.project, this.region)
      .subscribe(
        (data) => {
          this.endpointGroup = data;
          this.validateForm.controls.nameEndpointGroup.setValue(data.name);
          this.validateForm.controls.description.setValue(data.description);
        },
        (error) => {
          this.endpointGroup = null;
        }
      );
  }

  showModal(){
    this.isVisible = true
    this.getEndpointGroupById(this.id)
  }

  handleCancel(){
    this.isVisible = false
  }

  handleOk() {
    this.isLoading = true
    let formEdit = new FormEditEndpointGroup()
    formEdit.id = this.id
    formEdit.regionId = this.region
    formEdit.vpcId = this.project
    formEdit.name = this.validateForm.controls.nameEndpointGroup.value
    formEdit.description = this.validateForm.controls.description.value

    if(this.validateForm.valid){
      this.endpointGroupService.editEndpoinGroup(formEdit).subscribe(data => {
        this.notification.success( this.i18n.fanyi('app.status.success'),
        this.i18n.fanyi('app.endpoint-edit.success'))
          this.isVisible = false
          this.isLoading =  false
          this.onOk.emit(data)
      }, error => {
        this.notification.error( this.i18n.fanyi('app.status.fail'),
        this.i18n.fanyi('app.endpoint-edit.fail'))
        this.isVisible = false
        this.isLoading =  false
      })
    }
  }

  ngOnInit(){
    this.getEndpointGroupById(this.id);
  }

}
