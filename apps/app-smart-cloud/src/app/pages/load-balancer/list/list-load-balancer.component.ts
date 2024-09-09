import { Component, Inject, OnInit, ViewChild , ChangeDetectorRef} from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { Router } from '@angular/router';
import { BaseResponse, ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import { FormSearchListBalancer, LoadBalancerModel } from '../../../shared/models/load-balancer.model';
import { LoadBalancerService } from '../../../shared/services/load-balancer.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { debounceTime, Subject } from 'rxjs';
import { TimeCommon } from '../../../shared/utils/common';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { ProjectService } from '../../../shared/services/project.service';
import { CatalogService } from '../../../shared/services/catalog.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs/operators';
import { da } from 'date-fns/locale';
import { VpcService } from '../../../shared/services/vpc.service';
import { PolicyService } from 'src/app/shared/services/policy.service';
import { SizeInCloudProject } from 'src/app/shared/models/project.model';

@Component({
  selector: 'one-portal-list-load-balancer',
  templateUrl: './list-load-balancer.component.html',
  styleUrls: ['./list-load-balancer.component.less']
})
export class ListLoadBalancerComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  typeVPC: number;
  customerId: number;
  isBegin: boolean = false;
  value: string;
  isLoading: boolean = false;
  response: BaseResponse<LoadBalancerModel[]>;
  pageSize: number = 10;
  pageIndex: number = 1;
  loadBalancerStatus: Map<String, string>;
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  createNewLB: boolean = false;
  noneQuota: boolean;
  projectCurrentModel: any= undefined;
  isCreateOrder: boolean = false;
  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private router: Router,
              private cdr: ChangeDetectorRef,
              private loadBalancerService: LoadBalancerService,
              private projectService: ProjectService,
              private vpcService: VpcService,
              private catalogService: CatalogService,
              private notification: NzNotificationService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private policyService: PolicyService) {
    this.loadBalancerStatus = new Map<String, string>();
    this.loadBalancerStatus.set('KHOITAO', this.i18n.fanyi('app.status.running'));
    this.loadBalancerStatus.set('HUY', this.i18n.fanyi('app.status.low-renew'));
  }

  regionChanged(region: RegionModel) {
    this.loading = true;
    this.isFirstVisit = false;
    this.region = region.regionId;
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.search(true);
  }


  onRegionChanged(region: RegionModel) {
    this.loading = true;
    this.isFirstVisit = false;
    this.region = region.regionId;
  }
  projectName:string;
  // projectChanged(project: ProjectModel) {
  //   console.log("ooo",project)
  //   this.loading = true;
  //   this.isFirstVisit = false;
  //   this.projectCurrentModel = project;
  //   this.isLoading = true;
  //   this.createNewLB = false;
  //   this.project = project?.id;
  //   this.projectName = project.projectName
  //   this.typeVPC = project?.type;
  //   this.isBegin = false
  //   setTimeout(() => {
  //     this.search(true);
  //     this.getProject();
  //     this.loading = false;
  //   }, 2000);
  //   this.isCreateOrder = this.policyService.hasPermission("order:Create") &&
  //     this.policyService.hasPermission("network:List") &&
  //     this.policyService.hasPermission("product:Search") &&
  //     this.policyService.hasPermission("loadbalancer:List") &&
  //     this.policyService.hasPermission("loadbalancer:Get") &&
  //     this.policyService.hasPermission("offer:Get") &&
  //     this.policyService.hasPermission("ippublic:IpPublicListSubnet") &&
  //     this.policyService.hasPermission("order:GetOrderAmount") &&
  //     this.policyService.hasPermission("offer:Search");
  // }

  projectChanged(project: ProjectModel) {
    this.loading = true;
    this.isFirstVisit = false;
    this.projectCurrentModel = project;
    this.isLoading = true;
    this.createNewLB = false;
    this.project = project?.id;
    this.typeVPC = project?.type;
    this.isBegin = false
    if (this.typeVPC == 1) {
      this.projectService.getProjectVpc(this.project)
        .pipe(finalize(() => {
        
          this.search(true);
        }))
        .subscribe(data => {
        
          const LBId = data?.cloudProject?.offerIdLBSDN;
          if (LBId != undefined && LBId != null) {
            this.catalogService.getDetailOffer(LBId)
              .pipe(finalize(() => {
                this.loading = false;
              }))
              .subscribe(
              data2 => {
                this.createNewLB = false;
              },
              error => {
                this.createNewLB = true;
                this.notification.error(this.i18n.fanyi('app.status.fail'), 'Lấy thông tin Flavor lỗi');
              });
          } else {
            this.createNewLB = true;
          }
        });

      this.vpcService.getTotalResouce(this.project)
        .subscribe(
          data => {
            if (data.cloudProject?.quotaLoadBalancerSDNCount-data.cloudProjectResourceUsed?.loadBalancerSdnCount <= 0) {
              this.noneQuota = true;
            } else {
              this.noneQuota = false;
            }
          }
        )
    } else {
      this.search(true);
    }
    this.isCreateOrder = this.policyService.hasPermission("order:Create") &&
      this.policyService.hasPermission("network:List") &&
      this.policyService.hasPermission("product:Search") &&
      this.policyService.hasPermission("loadbalancer:List") &&
      this.policyService.hasPermission("loadbalancer:Get") &&
      this.policyService.hasPermission("offer:Get") &&
      this.policyService.hasPermission("ippublic:IpPublicListSubnet") &&
      this.policyService.hasPermission("order:GetOrderAmount") &&
      this.policyService.hasPermission("offer:Search");
  }
  projectInfo: SizeInCloudProject = new SizeInCloudProject();
  getProject() {
    this.projectService.getByProjectId(this.project).subscribe((data) => {
      this.projectInfo = data;
      console.log("this.projectInfo",this.projectInfo)
    });
  }
  onPageSizeChange(value) {
    this.pageSize = value;
    this.search(false);
  }

  onPageIndexChange(value) {
    this.pageIndex = value;
    this.search(false);
  }

  navigateToCreate(typeVpc) {
    this.alertLB = false;
    if (!this.isLoading) {
      console.log(typeVpc);
      let hasRoleSI = localStorage.getItem('role').includes('SI');
      if (typeVpc === 1 || hasRoleSI) {
        if (this.noneQuota) {
          this.notification.warning('Cảnh báo','Quý khách vui lòng mua thêm quota cho Load Balancer')
          this.alertLB = true;
        } else {
          this.router.navigate(['/app-smart-cloud/load-balancer/create/vpc']);
        }
      }
      if (typeVpc !== 1) {
        this.router.navigate(['/app-smart-cloud/load-balancer/create']);
      }
    }
  }

  handleUpdateNoVpcOk() {
    this.search(false);
  }

  navigateToUpdateVpc(id) {
    this.router.navigate(['/app-smart-cloud/load-balancer/update/vpc/' + id]);
  }

  navigateToExtend(id) {
    this.router.navigate(['/app-smart-cloud/load-balancer/extend/normal/' + id]);
  }

  search(isBegin) {
    this.isLoading = true;
    this.loading = true;
    let formSearch = new FormSearchListBalancer();
    formSearch.vpcId = this.project;
    formSearch.regionId = this.region;
    // formSearch.name = this.value;
    formSearch.name = this.projectName;
    formSearch.pageSize = this.pageSize;
    formSearch.currentPage = this.pageIndex;
    console.log('Sending formSearch payload:', formSearch);
    this.loadBalancerService.search(formSearch)

    
      .pipe(finalize(() => {
        this.loading = false;
        this.isLoading = false;
      }))
      .subscribe(data => {
      this.response = data;
      if (isBegin) {
        this.isBegin = this.response.records.length < 1 || this.response.records === null ? true : false;
      }
      this.cdr.detectChanges();
    }, error => {
      this.isLoading = false;
      this.response = null;
      if(error.status == 403){
        this.notification.error(
          error.statusText,
          this.i18n.fanyi('app.non.permission')
        );
      }
    });
  }

  handleDeleteOk() {
    if (this.typeVPC == 1) {
      this.projectChanged(this.projectCurrentModel);
    } else {
      this.search(true);
    }
  }

  navigateToCreateListener(idLb: number) {
    this.router.navigate(['/app-smart-cloud/load-balancer/' + idLb + '/listener/create']);
  }
  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/load-balancer/list' ]);
  }
  searchDelay = new Subject<boolean>();
  isFirstVisit: boolean = true;
  loading = true;
  alertLB = false;

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    console.log("regionAndProject",regionAndProject)
    if (!this.region || !this.project) {
      this.isLoading = true;
    }
    console.log('project', this.project);
    this.customerId = this.tokenService.get()?.userId;

    this.searchDelay.pipe(debounceTime(TimeCommon.timeOutSearch)).subscribe(() => {
      this.search(false);
    });
  }
}
