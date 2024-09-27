import { ChangeDetectorRef, Component, Inject, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ListenerService } from '../../../../shared/services/listener.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ipAddressValidator } from '../create/listener-create.component';
import { da } from 'date-fns/locale';
import { LoadBalancerService } from '../../../../shared/services/load-balancer.service';
import { L7Policy } from '../../../../shared/models/load-balancer.model';
import { finalize } from 'rxjs/operators';
import { RegionModel, ProjectModel, AppValidator } from '../../../../../../../../libs/common-utils/src';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';

@Component({
  selector: 'one-portal-listener-update',
  templateUrl: './listener-update.component.html',
  styleUrls: ['./listener-update.component.less'],
})
export class ListenerUpdateComponent implements OnInit, OnChanges {
  regionId = JSON.parse(localStorage.getItem('regionId'));
  projectId = JSON.parse(localStorage.getItem('projectId'));
  idListener: any;
  idLb: number;
  listPool: any;
  listL7: L7Policy[];
  validateForm: FormGroup<{
    listenerName: FormControl<string>
    port: FormControl<number>
    member: FormControl<number>
    connection: FormControl<number>
    timeout: FormControl<number>
    allowCIRR: FormControl<string>
    description: FormControl<string>

    poolName: FormControl<number>
  }> = this.fb.group({
    listenerName: ['', [Validators.required,
    Validators.pattern(/^[a-zA-Z0-9_]*$/), Validators.maxLength(50)]],
    port: [0, Validators.required],
    member: [1],
    connection: [1],
    timeout: [1],
    allowCIRR: ['', [Validators.required, AppValidator.ipWithCIDRValidator]],
    description: [''],

    poolName: [0]
  });
  protocolListener: any;
  listAlgorithm = [
    { value: 'ROUND_ROBIN', name: 'Round robin' },
    { value: 'LEAST_CONNECTIONS', name: 'Least connections' },
    { value: 'SOURCE_IP', name: 'source ip' },
  ];

  currentPageData: L7Policy[]
  pageSize: number = 5
  pageIndex: number = 1

  isLoading: boolean = false

  loadingDetail = true;
  loadingL7 = true;
  loadingPool = true;
  data: any;
  listCert: any = null;
  certId: any;
  isAddHeader: boolean = false;
  xFor: boolean = false;
  xProto: boolean = false;
  xPort: boolean = false;
  // xFor: string;
  // xProto: string;
  // xPort: boolean = false;
  selectedPool: string;
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  constructor(private router: Router,
    private fb: NonNullableFormBuilder,
    private service: ListenerService,
    private notification: NzNotificationService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private loadBalancerService: LoadBalancerService) {
  }

  ngOnInit(): void {
    this.idLb = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('lbId'));
    this.idListener = this.activatedRoute.snapshot.paramMap.get('id');
    this.loadSSlCert();
    // 
    this.getData();
    // this.getListPoolForListener();
    this.cdr.detectChanges();

  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("goi lai list L7 Policy")
    if (changes.checkCreate) {
      this.getListL7Policy(this.idListener)
    }
  }
  onPageSizeChange(value) {
    this.pageSize = value
    this.getListL7Policy(this.idListener)
  }

  onPageIndexChange(value) {
    this.pageIndex = value
    this.getListL7Policy(this.idListener)
  }

  updateListener() {
    const data = {
      id: this.data.listenerId,
      lbId: this.activatedRoute.snapshot.paramMap.get('lbId'),
      idleTimeOutConnection: this.validateForm.controls['connection'].value,
      allowedCIDR: this.validateForm.controls['allowCIRR'].value,
      description: this.validateForm.controls['description'].value,
      idleTimeOutMember: this.validateForm.controls['member'].value,
      sslCert: this.protocolListener == 'TERMINATED_HTTPS' ? this.certId : '',
      idleTimeOutClient: this.validateForm.controls['timeout'].value,
      name: this.validateForm.controls['listenerName'].value,
      defaultPoolId: this.selectedPool,
      // XFor: this.xFor,
      // XProto: this.xProto,
      // XPort: this.xPort,
      xFor:   this.xFor,
      xProto:this.xProto,
      xPort:this.xPort
    };
    this.service.updateListener(data).subscribe(
      data => {
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.notification.update.listener.success'))
        this.router.navigate(['/app-smart-cloud/load-balancer/detail/' + this.activatedRoute.snapshot.paramMap.get('lbId')]);
      },
      error => {
        if (error?.error?.detail != undefined && error?.error?.detail != '') {
          this.notification.error(this.i18n.fanyi('app.status.fail'), error?.error?.detail)
        } else {
          this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.notification.update.listener.fail'))
        }
      }
    );
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    if (this.projectCombobox) {
      this.projectCombobox.loadProjects(true, region.regionId);
    }
  }

  projectChange(project: ProjectModel) {
    this.projectId = project.id;
  }

  private getData() {
    this.service.getDetail(this.activatedRoute.snapshot.paramMap.get('id'), this.activatedRoute.snapshot.paramMap.get('lbId'))
      .pipe(finalize(() => {
        this.loadingDetail = false;
      }))
      .subscribe(
        data => {
          this.data = data;
          console.log("aa", this.data)
          this.validateForm.controls['listenerName'].setValue(data.name);
          this.validateForm.controls['port'].setValue(data.port);
          this.validateForm.controls['timeout'].setValue(data.timeoutClientData);
          this.validateForm.controls['member'].setValue(data.timeoutMemberData);
          this.validateForm.controls['connection'].setValue(data.timeoutMemberConnect);
          this.validateForm.controls['allowCIRR'].setValue(data.allowedCidrs[0]);
          this.validateForm.controls['description'].setValue(data.description);

          this.certId = data.certSSL;
          this.protocolListener = data.protocol;
          this.getPool(this.activatedRoute.snapshot.paramMap.get('id'));

          this.getListL7Policy(this.activatedRoute.snapshot.paramMap.get('id'));

         
          this.selectedPool = this.data.defaultPoolId
          console.log(" this.selectedPool", this.selectedPool)
         
        
          this.xFor = data.xFor;
          this.xProto = data.xPort;
          this.xPort = data.xProto;
          this.getListPoolForListener();

          if (this.protocolListener == 'TERMINATED_HTTPS' || this.protocolListener == 'HTTP') {
            this.isAddHeader = true;
          }
          else {
            this.isAddHeader = false;
          }
          
        }
      )
  }

  private getListL7Policy(id: string) {
    this.isLoading = true
    this.loadBalancerService.getListL7Policy(this.regionId, this.projectId, id).subscribe(
      data => {
        this.isLoading = false
        this.listL7 = data;
        const startIndex = (this.pageIndex - 1) * this.pageSize;
        const endIndex = this.pageIndex * this.pageSize;

        this.currentPageData = this.listL7.slice(startIndex, endIndex);
      }, error => {
        this.isLoading = false
        this.listL7 = null
      })
  }


  private getPool(id: string) {
    this.loadingPool = true;
    this.service.getPool(id, this.regionId, this.projectId)
      .pipe(finalize(() => {
        this.loadingPool = false;
      })).subscribe(
        data => {
          this.listPool = data.records;
          // this.poolForListener= this.listPool.filter((item)=>!item.listener_id &&  item.protocol==this.protocolListener)
          // console.log("object33",this.listPool)
          this.loadingPool = false;
        }
      )
  }

  changePoolForListener(value: any) {
    this.selectedPool = value;
  }

  handleDeleteL7PolicyOk() {
    setTimeout(() => { this.getListL7Policy(this.idListener) }, 2500)
  }

  handleEditOk() {
    this.getPool(this.activatedRoute.snapshot.paramMap.get('id'))
  }

  handleDeleteOk() {
    this.getPool(this.activatedRoute.snapshot.paramMap.get('id'));
  }

  navigateToDetail(id) {
    this.router.navigate([
      '/app-smart-cloud/load-balancer/pool-detail/' + id,
      { idLB: this.idLb },
    ]);
  }

  private loadSSlCert() {
    this.service.loadSSlCert(this.tokenService.get()?.userId, this.regionId, this.projectId).subscribe(
      data => {
        // debugger
        this.listCert = data;
        console.log(" this.listCert", this.listCert)
      }
    )
  }
  poolForListener: any;
  // lấy ds pool chưa thuộc listenner nào
  getListPoolForListener() {
    this.loadBalancerService.getListPoolInLB(this.idLb).subscribe(
      data => {
        this.poolForListener = data.filter((item) => item.id == this.data.defaultPoolId || (!item.listener_id && item.protocol == this.protocolListener));
        console.log(" this.poolList 123", this.poolForListener)
     
      })

  }
  // lấy trạng thái true/false của xFor, XPort, XProto
  changeChecked(checkboxName: string, value: boolean) {
    this[checkboxName] = value
  }
  changeCert(value:string){
    this.certId = value;
    console.log("this.certId",this.certId)
  }
}
