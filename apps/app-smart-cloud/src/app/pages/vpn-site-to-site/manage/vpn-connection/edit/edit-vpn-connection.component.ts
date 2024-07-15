import { Component, Inject, OnInit, ViewChild } from '@angular/core';
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
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NAME_SPECIAL_REGEX, PEER_VPN_REGEX } from 'src/app/shared/constants/constants';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';

@Component({
  selector: 'one-portal-edit-vpn-connection',
  templateUrl: './edit-vpn-connection.component.html',
  styleUrls: ['./edit-vpn-connection.component.less'],
})
export class EditVpnConnectionComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  formEditVpnConnection: FormEditVpnConnection = new FormEditVpnConnection();
  vpnConnection: VpnConnectionDetail = new VpnConnectionDetail();

  preSharedKeyVisible: boolean = false;
  isLoading: boolean = false
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  form: FormGroup<{
    name: FormControl<string>;
    peerRemoteIp: FormControl<string>;
    peerId: FormControl<string>;
    preSharedKey: FormControl<string>;
  }> = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(NAME_SPECIAL_REGEX)]],
    peerRemoteIp: [
      '',
      [
        Validators.required,
        Validators.pattern(
          PEER_VPN_REGEX
        ),
      ],
    ],
    peerId: [
      '',
      [
        Validators.required,
        Validators.pattern(
          PEER_VPN_REGEX
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
    private vpnConnectionService: VpnConnectionService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
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
              this.i18n.fanyi('app.status.success'),
              this.i18n.fanyi('app.vpn-connection-edit.success')
            );
            this.router.navigate(['/app-smart-cloud/vpn-site-to-site']);
          },
          (error) => {
            this.isLoading = false
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              this.i18n.fanyi('app.vpn-connection-edit.fail')
            );
            console.log(error);
          }
        );
    }
  }

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.router.navigate(['/app-smart-cloud/vpn-site-to-site']);
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.project = project?.id;
  }

  userChangeProject(){
    this.router.navigate(['/app-smart-cloud/vpn-site-to-site']);
  }
}
