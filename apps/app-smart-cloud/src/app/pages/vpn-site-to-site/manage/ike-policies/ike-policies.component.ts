import { Component, EventEmitter, Inject, Input, Output, SimpleChanges } from '@angular/core';
import { FormSearchIKEPolicy, IKEPolicyModel} from 'src/app/shared/models/vpns2s.model';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { IkePolicyService } from 'src/app/shared/services/ike-policy.service';
import { BaseResponse } from '../../../../../../../../libs/common-utils/src';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { RegionModel } from 'src/app/shared/models/region.model';
import { debounceTime } from 'rxjs';
import { getCurrentRegionAndProject } from '@shared';

@Component({
  selector: 'one-portal-ike-policies',
  templateUrl: './ike-policies.component.html',
  styleUrls: ['./ike-policies.component.less']
})

export class IkePoliciesComponent {
   region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  customerId: number

  pageSize: number = 5
  pageIndex: number = 1

  value: string

  response: BaseResponse<IKEPolicyModel>

  isLoading: boolean = false

  formSearchIkePolicy: FormSearchIKEPolicy = new FormSearchIKEPolicy()

  constructor(private ikePolicyService: IkePolicyService,
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
    console.log("page index ike --- " , event)
    this.pageIndex = event;
    this.getData();
  }

  getData() {
    this.isLoading = true
    this.formSearchIkePolicy.projectId = this.project
    this.formSearchIkePolicy.regionId = this.region
    this.formSearchIkePolicy.searchValue =this.value
    console.log("get data");
    console.log(this.formSearchIkePolicy);
    this.formSearchIkePolicy.pageSize = this.pageSize
    this.formSearchIkePolicy.pageNumber = this.pageIndex
    this.ikePolicyService.getIKEpolicy(this.formSearchIkePolicy)
      .pipe(debounceTime(500))
      .subscribe(data => {
      this.isLoading = false
        console.log('data- IKE---', data)
      this.response = data
    })
  }

  handleOkDelete(){
    this.getData()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.project && !changes.project.firstChange) {

      this.getData();
    }
    if (changes.region && !changes.region.firstChange) {

      this.refreshParams();
    }
  }
  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.project = project?.id;
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
    console.log("region",this.region);
      this.getData();
  }
}
