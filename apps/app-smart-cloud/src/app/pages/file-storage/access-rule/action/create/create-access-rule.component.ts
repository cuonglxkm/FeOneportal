import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormSearchNetwork, NetWorkModel } from '../../../../../shared/models/vlan.model';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VlanService } from '../../../../../shared/services/vlan.service';
import { IpFloatingService } from '../../../../../shared/services/ip-floating.service';
import { FormCreateIp } from '../../../../../shared/models/ip-floating.model';
import { getCurrentRegionAndProject } from '@shared';

@Component({
  selector: 'one-portal-create-access-rule',
  templateUrl: './create-access-rule.component.html',
  styleUrls: ['./create-access-rule.component.less'],
})
export class CreateAccessRuleComponent implements OnInit {
  @Input() region: number
  @Input() project: number
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false

  listNetwork: NetWorkModel[] = []
  validateForm: FormGroup<{
    name: FormControl<string>
  }> = this.fb.group({
    name: ['', [Validators.required]]
  });

  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private route: ActivatedRoute,
              private fb: NonNullableFormBuilder) {
  }

  showModalCreate() {
    this.isVisible = true
  }

  handleCancel() {
    this.isVisible = false
    this.isLoading = false
    this.validateForm.reset()
    this.onCancel.emit()
  }

  submitForm() {

  }


  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
  }
}
