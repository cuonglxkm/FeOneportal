import { Component, Inject, Input, SimpleChanges } from '@angular/core';
import { FormSearchIKEPolicy, IKEPolicyModel} from 'src/app/shared/models/vpns2s.model';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { IkePolicyService } from 'src/app/shared/services/ike-policy.service';
import { BaseResponse, ProjectModel, RegionModel } from '../../../../../../../../libs/common-utils/src';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { debounceTime, Subject, take } from 'rxjs';
import { getCurrentRegionAndProject } from '@shared';
import { PolicyService } from 'src/app/shared/services/policy.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-ike-policies',
  templateUrl: './ike-policies.component.html',
  styleUrls: ['./ike-policies.component.less']
})

export class IkePoliciesComponent {
  @Input() project: number
  @Input() region: number
  @Input() isBegin: boolean
  customerId: number

  pageSize: number = 5
  pageIndex: number = 1
  pageSizeFixed = 5
  value: string = ''

  response: BaseResponse<IKEPolicyModel>

  isLoading: boolean = false

  formSearchIkePolicy: FormSearchIKEPolicy = new FormSearchIKEPolicy()

  searchDelay = new Subject<boolean>();
  isCreatePermission: boolean = false;
  constructor(private ikePolicyService: IkePolicyService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private policyService: PolicyService
    ) {
}

  refreshParams() {
    this.pageSize = 5;
    this.pageIndex = 1;
  }
  
  search(search: string) {
    this.value = search.trim();
    this.refreshParams()
    this.getData();
  }


  onPageSizeChange(event) {
    this.pageSize = event
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
    this.formSearchIkePolicy.searchValue =this.value.trim()
    this.formSearchIkePolicy.pageSize = this.pageSize
    this.formSearchIkePolicy.pageNumber = this.pageIndex
    this.ikePolicyService.getIKEpolicy(this.formSearchIkePolicy)
      .pipe(debounceTime(500))
      .pipe(take(1))
      .subscribe(data => {
      this.isLoading = false
      this.response = data;
      this.isCreatePermission = this.policyService.hasPermission("vpnsitetosites:VPNCreateIKEPolicy");
    }, error => {
      this.isLoading = false;
      this.response = null;
      console.log(error);
      if(error.status == 403){
        this.notification.error(
          error.statusText,
          this.i18n.fanyi('app.non.permission', { serviceName: 'Danh sách IKE Policies' })
        );
      }
      this.isCreatePermission = this.policyService.hasPermission("vpnsitetosites:VPNCreateIKEPolicy");
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
    this.isBegin && this.getData();
    this.searchDelay.pipe(debounceTime(1200)).subscribe(() => {
      this.refreshParams()
      this.getData();
    });
  }
}
