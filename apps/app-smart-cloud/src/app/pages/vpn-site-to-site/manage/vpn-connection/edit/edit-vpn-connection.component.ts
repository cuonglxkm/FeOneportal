import { Component, Inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { getCurrentRegionAndProject } from '@shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormEditVpnConnection, VpnConnectionDetail } from 'src/app/shared/models/vpn-connection';
import { VpnConnectionService } from 'src/app/shared/services/vpn-connection.service';
import { RegionModel, ProjectModel } from '../../../../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-edit-vpn-connection',
  templateUrl: './edit-vpn-connection.component.html',
  styleUrls: ['./edit-vpn-connection.component.less'],
})
export class EditVpnConnectionComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  formEditVpnConnection: FormEditVpnConnection = new FormEditVpnConnection();
  vpnConnection: VpnConnectionDetail = new VpnConnectionDetail();

  preSharedKeyVisible: boolean = false;
  isLoading: boolean = false

  form: FormGroup<{
    peerRemoteIp: FormControl<string>;
    peerId: FormControl<string>;
    preSharedKey: FormControl<string>;
  }> = this.fb.group({
    peerRemoteIp: [
      '',
      [
        Validators.required,
        Validators.pattern(
          /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
        ),
      ],
    ],
    peerId: [
      '',
      [
        Validators.required,
        Validators.pattern(
          /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
        ),
      ],
    ],
    preSharedKey: ['', [Validators.required]],
  });

  getVpnConnectionById(id) {
    this.vpnConnectionService
      .getVpnConnectionById(id, this.project, this.region)
      .subscribe(
        (data) => {
          this.vpnConnection = data;

          this.form.controls.peerRemoteIp.setValue(data.peerRemoteIp);
          this.form.controls.peerId.setValue(data.peerId);
          this.form.controls.preSharedKey.setValue(data.preSharedKey);
        },
        (error) => {
          this.vpnConnection = null;
        }
      );
  }

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    this.getVpnConnectionById(this.activatedRoute.snapshot.paramMap.get('id'));
  }

  constructor(
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private activatedRoute: ActivatedRoute,
    private fb: NonNullableFormBuilder,
    private notification: NzNotificationService,
    private vpnConnectionService: VpnConnectionService
  ) {}

  getData(): any {
    this.formEditVpnConnection.customerId = this.tokenService.get()?.userId;
    this.formEditVpnConnection.id =
      this.activatedRoute.snapshot.paramMap.get('id');
    this.formEditVpnConnection.regionId = this.region;
    this.formEditVpnConnection.projectId = this.project;
    this.formEditVpnConnection.name = this.vpnConnection?.name;
    this.formEditVpnConnection.ipSecPolicyId =
      this.vpnConnection?.ipSecPolicyId;
    this.formEditVpnConnection.vpnServiceId = this.vpnConnection?.vpnServiceId;
    this.formEditVpnConnection.peerRemoteIp =
      this.form.controls.peerRemoteIp.value;
    this.formEditVpnConnection.peerId = this.form.controls.peerId.value;
    this.formEditVpnConnection.ikepolicyId = this.vpnConnection?.ikepolicyId;
    this.formEditVpnConnection.localEndpointGroupId =
      this.vpnConnection?.localEndpointGroupId;
    this.formEditVpnConnection.remoteEnpointGroupId =
      this.vpnConnection?.remoteEnpointGroupId;
    this.formEditVpnConnection.preSharedKey =
      this.form.controls.preSharedKey.value;
    this.formEditVpnConnection.maximumTransmissionUnit = 1500;
    this.formEditVpnConnection.deadPeerDetectionAction = 'hold';
    this.formEditVpnConnection.deadPeerDetectionInterval = 30;
    this.formEditVpnConnection.deadPeerDetectionTimeout = 120;
    this.formEditVpnConnection.initiatorState = 'bi-directional';
    return this.formEditVpnConnection;
  }

  handleEdit() {
    this.isLoading = true;
    if (this.form.valid) {
      this.formEditVpnConnection = this.getData();
      console.log(this.formEditVpnConnection);
      this.vpnConnectionService
        .edit(this.formEditVpnConnection)
        .subscribe(
          (data) => {
            this.isLoading = false
            this.notification.success(
              'Thành công',
              'Cập nhật vpn connection thành công'
            );
            this.router.navigate(['/app-smart-cloud/vpn-site-to-site/manage']);
          },
          (error) => {
            this.isLoading = false
            this.notification.error(
              'Thất bại',
              'Cập nhật vpn connection thất bại'
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
