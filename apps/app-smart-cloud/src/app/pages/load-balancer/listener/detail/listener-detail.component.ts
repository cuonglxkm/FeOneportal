import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ipAddressValidator } from '../create/listener-create.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ListenerService } from '../../../../shared/services/listener.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { finalize } from 'rxjs/operators';
import { RegionModel, ProjectModel } from '../../../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-listener-detail',
  templateUrl: './listener-detail.component.html',
  styleUrls: ['./listener-detail.component.less'],
})
export class ListenerDetailComponent implements OnInit{
  regionId = JSON.parse(localStorage.getItem('region')).regionId;
  projectId = JSON.parse(localStorage.getItem('projectId'));
  idListener: any;
  idLb: any;
  listPool: any;
  listL7: any;
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
  loadingDetail = true;
  loadingL7 = true;
  loadingPool = true;
  constructor(private router: Router,
              private fb: NonNullableFormBuilder,
              private service: ListenerService,
              private notification: NzNotificationService,
              private activatedRoute: ActivatedRoute,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,) {
  }

  ngOnInit(): void {
    this.getData();
    this.idListener = this.activatedRoute.snapshot.paramMap.get('id');
    this.idLb = this.activatedRoute.snapshot.paramMap.get('lbId');
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
          this.description = data.description;
          this.protocolListener = data.protocol;
          this.getPool(this.activatedRoute.snapshot.paramMap.get('id'));
          this.getL7Policy(this.activatedRoute.snapshot.paramMap.get('id'));
        }
      )
  }

  private getL7Policy(id: string) {
    this.service.getL7Policy(id, this.regionId, this.projectId)
      .pipe(finalize(()=>{
        this.loadingL7 = false;
      }))
      .subscribe(
        data => {
          this.listL7 = data;
        }
      )
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
  description: any;
}
