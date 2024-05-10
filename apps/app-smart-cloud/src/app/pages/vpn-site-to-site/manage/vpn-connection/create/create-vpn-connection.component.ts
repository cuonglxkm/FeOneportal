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
import { FormSearchIKEPolicy } from 'src/app/shared/models/vpns2s.model';
import { IkePolicyService } from 'src/app/shared/services/ike-policy.service';
import { FormSearchEndpointGroup } from 'src/app/shared/models/endpoint-group';
import { EndpointGroupService } from 'src/app/shared/services/endpoint-group.service';
import { FormSearchVpnService } from 'src/app/shared/models/vpn-service';
import { VpnServiceService } from 'src/app/shared/services/vpn-service.service';


@Component({
  selector: 'one-portal-create-vpn-connection',
  templateUrl: './create-vpn-connection.component.html',
  styleUrls: ['./create-vpn-connection.component.less'],
})
export class CreateVpnConnectionComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  ipsecPoliciesList: NzSelectOptionInterface[] = [];
  ikePoliciesList: NzSelectOptionInterface[] = [];
  localEndpointGroupList : NzSelectOptionInterface[] = [];
  remoteEndpointGroupList : NzSelectOptionInterface[] = [];
  vpnServiceList : NzSelectOptionInterface[] = [];

  selectedIkePolicy: string
  selectedIpsecPolicy: string
  selectedLocalEndpointGroup: string
  selectedRemoteEndpointGroup: string
  selectedVpnService: string

  selectedIkePolicyName: any
  selectedIpsecPolicyName: any
  selectedLocalEndpointGroupName: any
  selectedRemoteEndpointGroupName: any
  selectedVpnServiceName: any

  isLoading: boolean = false
  preSharedKeyVisible: boolean = false

  FormCreateVpnConnection: FormCreateVpnConnection =
    new FormCreateVpnConnection();
  formSearchIpsecPolicy: FormSearchIpsecPolicy = new FormSearchIpsecPolicy()  
  formSearchIkePolicy: FormSearchIKEPolicy = new FormSearchIKEPolicy()  
  formSearchEnpointGroup: FormSearchEndpointGroup = new FormSearchEndpointGroup()
  formSearchVpnService: FormSearchVpnService = new FormSearchVpnService()

  form: FormGroup<{
    name: FormControl<string>;
    peerRemoteIp: FormControl<string>
    peerId: FormControl<string>,
    preSharedKey: FormControl<string>,
  }> = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9][a-zA-Z0-9-_ ]{0,254}$/)]],
    peerRemoteIp: ['', [Validators.required, Validators.pattern(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)]],
    peerId: ['', [Validators.required, Validators.pattern(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)]],
    preSharedKey: ['', [Validators.required]],
  });

  constructor(
    private router: Router,
    private fb: NonNullableFormBuilder,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private vpnConnectionService: VpnConnectionService,
    private notification: NzNotificationService,
    private ipsecPolicyService: IpsecPolicyService,
    private ikePolicyService: IkePolicyService,
    private endpointGroupService: EndpointGroupService,
    private vpnServiceService: VpnServiceService
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
      console.log(data);        
      data.records.forEach(ipsecPolicy => {
        this.ipsecPoliciesList.push({label: ipsecPolicy.name, value: ipsecPolicy.id});
      })
      if (this.ipsecPoliciesList.length > 0) {
        this.selectedIpsecPolicy = this.ipsecPoliciesList[0].value;
        this.selectedIpsecPolicyName = this.ipsecPoliciesList.find(policy => policy.value === this.selectedIpsecPolicy)?.label
      }
    })
  }

  getDataIkePolices() {
    this.formSearchIkePolicy.projectId = this.project
    this.formSearchIkePolicy.regionId = this.region
    this.formSearchIkePolicy.searchValue = "kh"
    this.ikePolicyService.getIKEpolicy(this.formSearchIkePolicy)
      .subscribe(data => {
        console.log(data);  
      data.records.forEach(ikePolicy => {
        this.ikePoliciesList.push({label: ikePolicy.name, value: ikePolicy.cloudId});
      })
      if (this.ikePoliciesList.length > 0) {
        this.selectedIkePolicy = this.ikePoliciesList[0].value;
        this.selectedIkePolicyName = this.ikePoliciesList.find(policy => policy.value === this.selectedIkePolicy)?.label
      }
    })
  }

  // getSelectedIkePolicyName(): string {
  //   const selectedPolicy = this.ikePoliciesList.find(policy => policy.value == this.selectedIkePolicy);
  //   return selectedPolicy && selectedPolicy.label
  // }

  getDataEndPointGroup() {
    this.formSearchEnpointGroup.vpcId = this.project
    this.formSearchEnpointGroup.regionId = this.region
    this.formSearchEnpointGroup.name = ''
    this.formSearchEnpointGroup.pageSize = 1000
    this.formSearchEnpointGroup.currentPage = 1

    this.endpointGroupService.getListEndpointGroup(this.formSearchEnpointGroup)
      .subscribe(data => {
        console.log(data);  
      data.records.forEach(endPointGroup => {
        if (endPointGroup.type === 'subnet') {
          this.localEndpointGroupList.push({ label: endPointGroup.name, value: endPointGroup.id });
        } else if (endPointGroup.type === 'cidr') {
          this.remoteEndpointGroupList.push({ label: endPointGroup.name, value: endPointGroup.id });
        }
      })
      if (this.localEndpointGroupList.length > 0) {
        this.selectedLocalEndpointGroup = this.localEndpointGroupList[0].value;
        this.selectedLocalEndpointGroupName = this.localEndpointGroupList.find(policy => policy.value === this.selectedLocalEndpointGroup)?.label
      }
      if (this.remoteEndpointGroupList.length > 0) {
        this.selectedRemoteEndpointGroup = this.remoteEndpointGroupList[0].value;
        this.selectedRemoteEndpointGroupName = this.remoteEndpointGroupList.find(policy => policy.value === this.selectedRemoteEndpointGroup)?.label
      }
    })
  }

  getDataVpnService() {
    this.formSearchVpnService.projectId = this.project
    this.formSearchVpnService.regionId = this.region
    this.formSearchVpnService.name = ''
    this.formSearchVpnService.pageSize = 1000
    this.formSearchVpnService.currentPage = 1

    this.vpnServiceService.getVpnService(this.formSearchVpnService)
      .subscribe(data => {
        console.log(data);  
        data.records.forEach(vpnService => {
          this.vpnServiceList.push({label: vpnService.name, value: vpnService.id});
        })
      if (this.vpnServiceList.length > 0) {
        this.selectedVpnService = this.vpnServiceList[0].value;
        this.selectedVpnServiceName = this.vpnServiceList.find(policy => policy.value === this.selectedVpnService)?.label
      }
    })
  }



  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
    this.getDataIpsecPolices()
    this.getDataIkePolices()
    this.getDataEndPointGroup()
    this.getDataVpnService()
  }


 

  getData(): any {
    this.FormCreateVpnConnection.customerId =
      this.tokenService.get()?.userId;
    this.FormCreateVpnConnection.regionId = this.region;
    this.FormCreateVpnConnection.projectId = this.project;
    this.FormCreateVpnConnection.name =
      this.form.controls.name.value;
    this.FormCreateVpnConnection.ipSecPolicyId = this.selectedIpsecPolicy
    this.FormCreateVpnConnection.vpnServiceId = this.selectedVpnService
    this.FormCreateVpnConnection.peerRemoteIp = this.form.controls.peerRemoteIp.value;
    this.FormCreateVpnConnection.peerId = this.form.controls.peerId.value;
    this.FormCreateVpnConnection.ikepolicyId = this.selectedIkePolicy
    this.FormCreateVpnConnection.localEndpointGroupId = this.selectedLocalEndpointGroup
    this.FormCreateVpnConnection.remoteEnpointGroupId = this.selectedRemoteEndpointGroup
    this.FormCreateVpnConnection.preSharedKey = this.form.controls.preSharedKey.value;
    this.FormCreateVpnConnection.maximumTransmissionUnit = 1500;
    this.FormCreateVpnConnection.deadPeerDetectionAction = "hold";
    this.FormCreateVpnConnection.deadPeerDetectionInterval = 30;
    this.FormCreateVpnConnection.deadPeerDetectionTimeout = 120;
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
