import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { Component, Inject, Input } from '@angular/core';
import { debounceTime } from 'rxjs';
import { EndpointGroupDTO, FormSearchEndpointGroup } from 'src/app/shared/models/endpoint-group';
import { EndpointGroupService } from 'src/app/shared/services/endpoint-group.service';
import { BaseResponse } from '../../../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-endpoint-group',
  templateUrl: './endpoint-group.component.html',
  styleUrls: ['./endpoint-group.component.less']
})

export class EndpointGroupComponent {
  @Input() region: number 
  @Input() project: number 
  customerId: number

  pageSize: number = 5
  pageIndex: number = 1

  value: string

  response: BaseResponse<EndpointGroupDTO>

  isLoading: boolean = false

  formSearchEnpointGroup: FormSearchEndpointGroup = new FormSearchEndpointGroup()

  constructor(private endpointGroupService: EndpointGroupService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    ) {
}

  refreshParams() {
    this.pageSize = 5;
    this.pageIndex = 1;
  }
  
  onInputChange(value) {
    this.value = value;
    this.getData()
  }


  onPageSizeChange(event) {
    this.pageSize = event
    this.refreshParams();
    this.getData();
  }

  onPageIndexChange(event) {
    this.pageIndex = event;
    this.getData();
  }

  getData() {
    this.isLoading = true
    this.formSearchEnpointGroup.vpcId = this.project
    this.formSearchEnpointGroup.regionId = this.region
    this.formSearchEnpointGroup.name =this.value
    this.formSearchEnpointGroup.pageSize = this.pageSize
    this.formSearchEnpointGroup.currentPage = this.pageIndex
    this.endpointGroupService.getListEndpointGroup(this.formSearchEnpointGroup)
      .pipe(debounceTime(500))
      .subscribe(data => {
      this.isLoading = false
        console.log('data', data)
      this.response = data
    })
  }
  

  ngOnInit() {
      this.getData();
  }
}
