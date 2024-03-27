import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { RegionModel } from 'src/app/shared/models/region.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { VpnConnectionService } from 'src/app/shared/services/vpn-connection.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormSearchIpsecPolicy, IpsecPolicyDTO } from 'src/app/shared/models/ipsec-policy';
import { IpsecPolicyService } from 'src/app/shared/services/ipsec-policy.service';
import { debounceTime } from 'rxjs';
import { BaseResponse } from '../../../../../../../../../libs/common-utils/src';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { FormCreateVpnConnection } from 'src/app/shared/models/vpn-connection';


@Component({
  selector: 'one-portal-create-vpn-connection',
  templateUrl: './create-vpn-connection.component.html',
  styleUrls: ['./create-vpn-connection.component.less'],
})
export class CreateVpnConnectionComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  ipsecPolicy = [
    { label: 'sha1', value: '1' },
    { label: 'sha256', value: '2' },
    { label: 'sha384', value: '3' },
    { label: 'sha512', value: '4' },
  ];

  vpnService = [
    { label: 'tunnel', value: '1' },
    { label: 'transport', value: '2' },
  ];

  localSystemSubnet = [
    { label: 'seconds', value: '1' },
  ];

  ikePolicy = [
    { label: 'group5', value: '1' },
    { label: 'group2', value: '2' },
    { label: 'group14 ', value: '3' },
  ];

  transformProtocol = [
    { label: 'esp', value: '1' },
    { label: 'ah', value: '2' },
    { label: 'ah-esp ', value: '3' },
  ];
  ipsecPoliciesList: NzSelectOptionInterface[] = [];
  selectedIpsecPolicy: string
  selectedEncryptionMode = '1'
  selectedEncryptionAlgorithm = '1'
  selectedPerfectForwardSecrecy = '1'
  selectedTransformProtocol = '1'
  selectedLifetimeUnits = '1'
  isLoading: boolean = false
  
  FormCreateVpnConnection: FormCreateVpnConnection =
    new FormCreateVpnConnection();
  formSearchIpsecPolicy: FormSearchIpsecPolicy = new FormSearchIpsecPolicy()  
  form: FormGroup<{
    name: FormControl<string>;
    peerRemoteIp: FormControl<string>
    peerId: FormControl<string>,
    preSharedKey: FormControl<string>,
  }> = this.fb.group({
    name: ['', [Validators.required]],
    peerRemoteIp: ['', [Validators.required]],
    peerId: ['', [Validators.required]],
    preSharedKey: ['', [Validators.required]],
  });

  constructor(
    private router: Router,
    private fb: NonNullableFormBuilder,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private vpnConnectionService: VpnConnectionService,
    private notification: NzNotificationService,
    private ipsecPolicyService: IpsecPolicyService
  ) {}

  getDataIpsecPolices() {
    this.formSearchIpsecPolicy.vpcId = this.project
    this.formSearchIpsecPolicy.regionId = this.region
    this.formSearchIpsecPolicy.name = ""
    this.formSearchIpsecPolicy.pageSize = 1000
    this.formSearchIpsecPolicy.currentPage = 1
    this.ipsecPolicyService.getIpsecpolicy(this.formSearchIpsecPolicy)
      .pipe(debounceTime(500))
      .subscribe(data => {
      data.records.forEach(ipsecPolicy => {
        this.ipsecPoliciesList.push({label: ipsecPolicy.name, value: ipsecPolicy.name});
      })
      if (this.ipsecPoliciesList.length > 0) {
        this.selectedIpsecPolicy = this.ipsecPoliciesList[0].value;
      }
    })
  }



  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
    this.getDataIpsecPolices()
  }


 

  getData(): any {
    this.FormCreateVpnConnection.customerId =
      this.tokenService.get()?.userId;
    this.FormCreateVpnConnection.regionId = this.region;
    this.FormCreateVpnConnection.projectId = this.project;
    this.FormCreateVpnConnection.name =
      this.form.controls.name.value;
    this.FormCreateVpnConnection.ipSecPolicyId = this.selectedIpsecPolicy
    this.FormCreateVpnConnection.vpnServiceId = ""
    this.FormCreateVpnConnection.peerRemoteIp = this.form.controls.peerRemoteIp.value;
    this.FormCreateVpnConnection.peerId = this.form.controls.peerId.value;
    this.FormCreateVpnConnection.ikepolicyId = ""
    this.FormCreateVpnConnection.localSystemSubnet = ""
    this.FormCreateVpnConnection.remoteLocalSubnet = ""
    this.FormCreateVpnConnection.preSharedKey = this.form.controls.preSharedKey.value;
    this.FormCreateVpnConnection.maximumTransmissionUnit = 0;
    this.FormCreateVpnConnection.deadPeerDetectionAction = "hold";
    this.FormCreateVpnConnection.deadPeerDetectionInterval = 0;
    this.FormCreateVpnConnection.deadPeerDetectionTimeout = 0;
    this.FormCreateVpnConnection.initiatorState = "bi-directional";
    return this.FormCreateVpnConnection;
  }

  handleCreate() {
    this.isLoading = true;
    if (this.form.valid) {
      this.FormCreateVpnConnection = this.getData();
      console.log(this.FormCreateVpnConnection);
      this.vpnConnectionService
        .create(this.FormCreateVpnConnection)
        .subscribe(
          (data) => {
            this.isLoading = false
            this.notification.success(
              'Thành công',
              'Tạo mới vpn connection thành công'
            );
            this.router.navigate(['/app-smart-cloud/vpn-site-to-site/manage']);
          },
          (error) => {
            this.isLoading = false
            this.notification.error(
              'Thất bại',
              'Tạo mới vpn connection thất bại'
            );
            console.log(error);
          }
        );
    } 
  }

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.project = project?.id;
  }
}
