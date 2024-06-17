import { Component, Inject } from '@angular/core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '../../i18n/i18n.service';
import { RegionModel } from '../../shared/models/region.model';
import { ProjectModel } from '../../shared/models/project.model';
import { ECRInfo } from '../../model/ecr-detail.model';

@Component({
  selector: 'one-portal-list-service',
  templateUrl: './list-service.component.html',
  styleUrls: ['./list-service.component.css'],
})
export class ListServiceComponent {
  
  services : ECRInfo[] = []
  isShowIntroductionPage : boolean;
  statusFilter: number;
  listServiceStatus : any[] = [];
  keywordFilter : string;
  pageIndex: number;
  pageSize: number;
  total: number;
  serviceNameDelete : string;
  isInitModal = false;
  isErrorCheckDelete = false;
  msgError : string;
  currentService: any;
  isVisibleDelete = false;
  loading = false;
  projectId : number;
  regionId : number;

  constructor(
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) {
    this.isShowIntroductionPage = this.services.length > 0 ? false : true
  }

  searchServices(search:boolean) {
    // this.loading = true;
    // this.mongoService.searchCluster(this.regionId,this.projectId,this.statusFilter, this.keywordFilter, this.pageIndex, this.pageSize)
    // .pipe(finalize(() => this.loading = false))
    // .subscribe(
    //   (r) => {
    //     this.services = r.data.content;
    //     this.total = r.data.total;
    //     if(search)
    //     this.isShowIntroductionPage = this.services.length == 0;
    //   }
    // );
  }

  resetPageFilter() {
    // this.pageIndex = 1;
    // this.pageSize = 10;
  }

  changePage(page: number) {
    // this.pageIndex = page;
    // this.searchServices(false);
  }

  changeSize(size: number) {
    // this.pageSize = size;
    // this.searchServices(false);
  }

  changeStatusFilter(status: number) {
    // this.resetPageFilter();
    // this.statusFilter = status;
    // this.searchServices(false);
  }

  changeKeywordFilter() {

    // this.resetPageFilter();
    // this.keywordFilter = this.keywordFilter.trim();
    // this.searchServices(false);
  }

  deleteForm(data:any){
    // this.isVisibleDelete = true;
    // this.isErrorCheckDelete = false;
    // this.isInitModal = true;
    // this.msgError = '';
    // this.serviceNameDelete = '';
    // this.currentMongo = data;
  }

  handleCancelDelete(){
    // this.isVisibleDelete=false;
    // this.router.navigate(['/app-mongodb-replicaset']);

  }


  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.projectId = project.id;
    this.searchServices(true);
  }

  checkServiceNameDel(){
    // this.isInitModal = false;
    // if (this.serviceNameDelete.length == 0) {
    //   this.isErrorCheckDelete = true;
    //   this.msgError = this.i18n.fanyi('validation.service.name-required');
    // } else if (this.serviceNameDelete != this.currentMongo.service_name) {
    //   this.isErrorCheckDelete = true;
    //   this.msgError = this.i18n.fanyi('validation.service.name-not-correct');
    // } else {
    //   this.isErrorCheckDelete = false;
    //   this.msgError = '';
    // }
  }

  handleOkDelete(){
    // this.loadingSrv.open({ type: 'spin', text: 'Loading...' });

    // this.mongoService.deleteMongodbCluster(this.currentMongo.service_code)
    // .subscribe((r: any) => {
    //   if (r && r.code == 200) {
    //     this.utilService.showNotification(NotiStatusEnum.SUCCESS,r.message);
    //   } else{
    //     this.utilService.showNotification(NotiStatusEnum.ERROR,r.message);
    //   }
    //   this.isVisibleDelete=false;
    //   this.searchServices(true)
    //   this.loadingSrv.close();
    // });
  }

}
