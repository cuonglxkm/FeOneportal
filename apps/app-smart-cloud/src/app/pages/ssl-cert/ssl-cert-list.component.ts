import { Component, Inject } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { getCurrentRegionAndProject } from '@shared';
import { debounceTime } from 'rxjs';
import { FormSearchSslSearch } from 'src/app/shared/models/ssl-cert.model';
import { SSLCertService } from 'src/app/shared/services/ssl-cert.service';
import { BaseResponse, ProjectModel, RegionModel } from '../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-ssl-cert-list',
  templateUrl: './ssl-cert-list.component.html',
  styleUrls: ['./ssl-cert-list.component.less'],
})
export class SslCertListComponent {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  customerId: number

  pageSize: number = 10
  pageIndex: number = 1

  value: string

  response: BaseResponse<any>

  isLoading: boolean = false

  isBegin: boolean = false

  filteredData: []

  formSearchSslSearch: FormSearchSslSearch = new FormSearchSslSearch()

  constructor(private SslCertService: SSLCertService,
            @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
}

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    this.customerId = this.tokenService.get()?.userId
  }

  refreshParams() {
    this.pageSize = 10;
    this.pageIndex = 1;
}

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
    this.refreshParams();
  }

  projectChange(project: ProjectModel) {
    this.project = project.id;
    // this.projectType = project.type;
    this.getData();
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

  onInputChange(value: string): void {
    if (!value || value.trim() === "") { 
      this.filteredData = this.response.records; 
    } else {
      this.filteredData = this.response.records.filter(item => 
        item.name.toLowerCase().includes(value.toLowerCase())
      ); 
    }
    console.log(value);
    
    console.log(this.filteredData);
    
  }


  getData() {
    this.isLoading = true
    this.formSearchSslSearch.vpcId = this.project
    this.formSearchSslSearch.region = this.region
    this.formSearchSslSearch.customerId = this.customerId
    this.formSearchSslSearch.currentPage = this.pageIndex
    this.formSearchSslSearch.pageSize = this.pageSize
    this.SslCertService.getSslCert(this.formSearchSslSearch)
      .pipe(debounceTime(500))
      .subscribe(data => {
      console.log(data);
        
      this.isLoading = false
      this.response = data
      
    })
  }

  handleOkDeleteSslCert(){
    this.getData()
  }

}
