import { Component, Inject, OnChanges, OnInit, SimpleChanges } from '@angular/core';
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
import { RegionModel, ProjectModel } from '../../../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-listener-update',
  templateUrl: './listener-update.component.html',
  styleUrls: ['./listener-update.component.less'],
})
export class ListenerUpdateComponent implements OnInit, OnChanges {
  regionId = JSON.parse(localStorage.getItem('region')).regionId;
  projectId = JSON.parse(localStorage.getItem('projectId'));
  idListener: any;
  idLb: any;
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
    allowCIRR: ['', [Validators.required, ipAddressValidator()]],
    description: [''],

    poolName: [0]
  });
  protocolListener: any;
  listAlgorithm = [
    {value:'ROUND_ROBIN',name:'Round robin'},
    {value:'LEAST_CONNECTIONS',name:'Least connections'},
    {value:'SOURCE_IP',name:'source ip'},
  ];

  currentPageData: L7Policy[]
  pageSize: number = 5
  pageIndex: number = 1

  isLoading: boolean = false

  loadingDetail = true;
  loadingL7 = true;
  loadingPool = true;
  constructor(private router: Router,
              private fb: NonNullableFormBuilder,
              private service: ListenerService,
              private notification: NzNotificationService,
              private activatedRoute: ActivatedRoute,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private loadBalancerService: LoadBalancerService) {
  }

  ngOnInit(): void {
    this.getData();
    this.idListener = this.activatedRoute.snapshot.paramMap.get('id');
    this.idLb = this.activatedRoute.snapshot.paramMap.get('lbId');
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
      id: this.activatedRoute.snapshot.paramMap.get('id'),
      lbId: this.activatedRoute.snapshot.paramMap.get('lbId'),
      idleTimeOutConnection: this.validateForm.controls['connection'].value,
      allowedCIDR: this.validateForm.controls['allowCIRR'].value,
      description: this.validateForm.controls['description'].value,
      idleTimeOutMember: this.validateForm.controls['member'].value,
      sslCert: "",
      idleTimeOutClient: this.validateForm.controls['timeout'].value,
      name: this.validateForm.controls['listenerName'].value
    };
    this.service.updateListener(data).subscribe(
      data => {
        this.notification.success('Thành công', 'Cập nhật thành công')
        this.router.navigate(['/app-smart-cloud/load-balancer/detail/' + this.activatedRoute.snapshot.paramMap.get('lbId')]);
      },
      error => {
        this.notification.error('Thất bại', 'Cập nhật thất bại')
      }
    );
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
  }

  projectChange(project: ProjectModel) {
    this.projectId = project.id;
  }

  private getData() {
    this.service.getDetail(this.activatedRoute.snapshot.paramMap.get('id'),this.activatedRoute.snapshot.paramMap.get('lbId'))
      .pipe(finalize(() => {
        this.loadingDetail = false;
      }))
      .subscribe(
      data => {
        this.validateForm.controls['listenerName'].setValue(data.name);
        this.validateForm.controls['port'].setValue(data.port);
        this.validateForm.controls['timeout'].setValue(data.timeoutClientData);
        this.validateForm.controls['member'].setValue(data.timeoutMemberData);
        this.validateForm.controls['connection'].setValue(data.timeoutMemberConnect);
        this.validateForm.controls['allowCIRR'].setValue(data.allowedCidrs[0]);
        this.validateForm.controls['description'].setValue(data.description);
        this.protocolListener = data.protocol;
        this.getPool(this.activatedRoute.snapshot.paramMap.get('id'));
        this.getListL7Policy(this.activatedRoute.snapshot.paramMap.get('id'));
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
    this.service.getPool(id, this.regionId)
      .pipe(finalize(()=>{
        this.loadingPool = false;
      })).subscribe(
      data => {
        this.listPool = data.records;
      }
    )
  }

  handleDeleteL7PolicyOk() {
    setTimeout(() => {this.getListL7Policy(this.idListener)}, 1500)
  }
}
