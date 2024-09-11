import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { I18NService } from '@core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormDetailEndpointGroup, FormEditEndpointGroup, FormSearchEndpointGroup } from 'src/app/shared/models/endpoint-group';
import { EndpointGroupService } from 'src/app/shared/services/endpoint-group.service';

@Component({
  selector: 'one-portal-edit-endpoint-group',
  templateUrl: './edit-endpoint-group.component.html',
  styleUrls: ['./edit-endpoint-group.component.less'],
})
export class EditEndpointGroupComponent implements OnInit{
  @Input() region: number
  @Input() project: number
  @Input() id: string
  @Input() type: string
  @Input() endpoints: string
  @Output() onOk = new EventEmitter()
  nameList: string[] = [];
  isVisible: boolean = false
  isLoading: boolean = false

  endpointGroup: FormDetailEndpointGroup = new FormDetailEndpointGroup()
  formSearchEnpointGroup: FormSearchEndpointGroup =
    new FormSearchEndpointGroup();
  validateForm: FormGroup<{
    nameEndpointGroup: FormControl<string>
  }> = this.fb.group({
    nameEndpointGroup: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9][a-zA-Z0-9-_ ]{0,49}$/), this.duplicateNameValidator.bind(this)]],
  });

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private fb: NonNullableFormBuilder,
              private endpointGroupService: EndpointGroupService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
              ) {
  }

  ngOnInit(){
    this.getEndpointGroupById(this.id);
  }

  getListEndPoint() {
    this.formSearchEnpointGroup.vpcId = this.project;
    this.formSearchEnpointGroup.regionId = this.region;
    this.formSearchEnpointGroup.name = ''
    this.formSearchEnpointGroup.pageSize = 99999
    this.formSearchEnpointGroup.currentPage = 1   
    this.endpointGroupService
      .getListEndpointGroup(this.formSearchEnpointGroup)
      .subscribe((data) => {
        const filterName = data.records.filter((item) => item.name !== this.endpointGroup.name) 
        filterName.forEach((item) => {
          if (this.nameList.length > 0) {
            this.nameList.push(item.name);
          } else {
            this.nameList = [item.name];
          }
        });
      }, error => {
        this.nameList = null;
      });
  }

  getEndpointGroupById(id) {
    this.endpointGroupService
      .getEndpointGroupById(id, this.project, this.region)
      .subscribe(
        (data) => {
          this.endpointGroup = data;
          this.validateForm.controls.nameEndpointGroup.setValue(data.name);
          this.getListEndPoint()
        },
        (error) => {
          this.endpointGroup = null;
        }
      );
  }

  duplicateNameValidator(control) {
    const value = control.value;
    // Check if the input name is already in the list
    if (this.nameList && this.nameList.includes(value)) {
      return { duplicateName: true }; // Duplicate name found
    } else {
      return null; 
    }
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


}
