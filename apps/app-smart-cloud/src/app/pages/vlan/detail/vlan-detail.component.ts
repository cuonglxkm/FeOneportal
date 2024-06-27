import { Component, Inject, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { VlanService } from '../../../shared/services/vlan.service';
import { BaseResponse, ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { FormSearchSubnet, Port, Subnet } from '../../../shared/models/vlan.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-vlan-detail',
  templateUrl: './vlan-detail.component.html',
  styleUrls: ['./vlan-detail.component.less']
})
export class VlanDetailComponent implements OnInit, OnChanges, OnDestroy {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  selectedIndextab: number = 0;
  idNetwork: number;

  networkName: string;
  networkCloudId: string = '';

  isLoading: boolean = false;
  isLoadingSubnet: boolean = false;
  isLoadingPort: boolean = false;

  valueSubnet: string;
  valuePort: string;

  pageSizeSubnet: number = 10;
  pageIndexSubnet: number = 1;

  pageSizePort: number = 10;
  pageIndexPort: number = 1;

  responseSubnet: BaseResponse<Subnet[]>;
  responsePort: BaseResponse<Port[]>;

  dataSubjectInputSearchSubnet: Subject<any> = new Subject<any>();
  private searchSubscriptionSubnet: Subscription;
  private enterPressedSubnet: boolean = false;

  dataSubjectInputSearchPort: Subject<any> = new Subject<any>();
  private searchSubscriptionPort: Subscription;
  private enterPressedPort: boolean = false;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private vlanService: VlanService,
              private notification: NzNotificationService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { selectedIndextab: number };
    if (state) {
      this.selectedIndextab = state.selectedIndextab;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('reload');
    if (changes.checkDelete && changes.checkDelete.currentValue !== changes.checkDelete.previousValue) {
      setTimeout(() => {
        this.getVlanByNetworkId();
      }, 2000);
    }
  }

  ngOnDestroy() {
    if (this.searchSubscriptionSubnet) {
      this.searchSubscriptionSubnet.unsubscribe();
    }
    if (this.searchSubscriptionPort) {
      this.searchSubscriptionPort.unsubscribe();
    }
  }

  regionChanged(region: RegionModel) {
    this.router.navigate(['/app-smart-cloud/vlan/network/list']);
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
    // this.getVlanByNetworkId()
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/vlan/network/list']);
  }

  getVlanByNetworkId() {
    this.isLoading = true;
    this.vlanService.getVlanByNetworkId(this.idNetwork, this.project)
      .pipe(debounceTime(500)).subscribe(data => {
      this.networkName = data.name;
      this.isLoading = false;
      this.networkCloudId = data.cloudId;
      this.getSubnetByNetwork();
      this.getPortByNetwork();
    }, error => {
      this.isLoading = false;
      this.router.navigate(['/app-smart-cloud/vlan/network/list']);
      this.notification.error(this.i18n.fanyi('app.status.fail'), error.error.message);
    });
  }

  //SUBNET
  changeInputChangeSubnet(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.enterPressedSubnet = false;
    this.dataSubjectInputSearchSubnet.next(value);
  }

  onChangeInputChangeSubnet() {
    this.searchSubscriptionSubnet = this.dataSubjectInputSearchSubnet.pipe(
      debounceTime(700)
    ).subscribe(res => {
      if (!this.enterPressedSubnet) {
        this.valueSubnet = res.trim();
        this.getSubnetByNetwork();
      }
    });
  }

  onEnterSubnet(event: Event) {
    event.preventDefault();
    this.enterPressedSubnet = true;
    const value = (event.target as HTMLInputElement).value;
    this.valueSubnet = value.trim();
    this.getSubnetByNetwork();
  }

  onPageSizeChangeSubnet(value) {
    this.pageSizeSubnet = value;
    this.getSubnetByNetwork();
  }

  onPageIndexChangeSubnet(value) {
    this.pageIndexSubnet = value;
    this.getSubnetByNetwork();
  }

  navigateToCreateSubnet() {
    this.router.navigate(['/app-smart-cloud/vlan/' + this.idNetwork + '/create/subnet']);
  }

  navigateToEditSubnet(idSubnet) {

    this.router.navigate(['/app-smart-cloud/vlan/' + this.idNetwork + '/network/edit/subnet/' + idSubnet]);
  }

  handleOkDeleteSubnet() {
    setTimeout(() => {
      this.vlanService.triggerReload();
      this.getVlanByNetworkId();
    }, 1500);
  }

  getSubnetByNetwork() {
    this.isLoadingSubnet = true;
    let formSearchSubnet = new FormSearchSubnet();
    formSearchSubnet.networkId = this.idNetwork;
    formSearchSubnet.customerId = this.tokenService.get()?.userId;
    formSearchSubnet.region = this.region;
    formSearchSubnet.pageSize = this.pageSizeSubnet;
    formSearchSubnet.pageNumber = this.pageIndexSubnet;
    formSearchSubnet.name = this.valueSubnet;

    this.vlanService.getSubnetByNetwork(formSearchSubnet).subscribe(data => {
      console.log('data-subnet', data);
      this.responseSubnet = data;
      this.isLoadingSubnet = false;
    }, error => {
      this.responseSubnet = null;
      this.notification.error(error.statusText, 'Lấy dữ liệu thất bại');
      this.isLoadingSubnet = false;
    });
  }

  //PORT
  onPageSizeChangePort(value) {
    this.pageSizePort = value;
    this.getPortByNetwork();
  }

  onPageIndexChangePort(value) {
    this.pageIndexPort = value;
    this.getPortByNetwork();
  }

  changeInputChangePort(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.enterPressedPort = false;
    this.dataSubjectInputSearchPort.next(value);
  }

  onChangeInputChangePort() {
    this.searchSubscriptionPort = this.dataSubjectInputSearchPort.pipe(
      debounceTime(700)
    ).subscribe(res => {
      if (!this.enterPressedPort) {
        this.valuePort = res.trim();
        this.getPortByNetwork();
      }
    });
  }

  onEnterPort(event: Event) {
    event.preventDefault();
    this.enterPressedPort = true;
    const value = (event.target as HTMLInputElement).value;
    this.valuePort = value.trim();
    this.getPortByNetwork();
  }

  getPortByNetwork() {
    this.isLoadingPort = true;
    console.log('networkcloud', this.networkCloudId);
    this.vlanService.getPortByNetwork(this.networkCloudId, this.region, this.pageSizePort, this.pageIndexPort, this.valuePort)
      .pipe(debounceTime(500))
      .subscribe(data => {
        console.log('port', data);
        this.responsePort = data;
        this.isLoadingPort = false;
      }, error => {
        this.responsePort = null;
        this.isLoadingPort = false;
        this.notification.error(error.statusText, 'Lấy dữ liệu thất bại');
      });
  }

  handleOkAttach() {
    setTimeout(() => {
      this.getVlanByNetworkId();
    }, 1000);
  }

  handleOkDetach() {
    setTimeout(() => {
      this.getVlanByNetworkId();
    }, 1000);

  }

  handleOkDeletePort() {
    setTimeout(() => {
      this.getVlanByNetworkId();
    }, 1500);

  }

  handleOkCreatePort() {
    setTimeout(() => {
      this.getVlanByNetworkId();
    }, 1000);
  }

  ngOnInit() {
    console.log('render');
    this.idNetwork = Number.parseInt(this.route.snapshot.paramMap.get('id'));
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.onChangeInputChangePort();
    this.onChangeInputChangeSubnet();

    // this.onPageIndexChangePort(1)
    setTimeout(() => {
      this.getVlanByNetworkId();
    }, 1000);

    console.log('cloudId', this.networkCloudId);
    if (this.networkCloudId != '') {
      setTimeout(() => {
        this.getPortByNetwork();
      }, 500);
    }

  }

}
