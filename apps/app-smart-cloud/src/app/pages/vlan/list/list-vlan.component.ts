import { Component, OnInit } from '@angular/core';
import { FormSearchNetwork, NetWorkModel } from '../../../shared/models/vlan.model';
import { AppValidator, BaseResponse, ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import { VlanService } from '../../../shared/services/vlan.service';
import { ActivatedRoute, Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { debounceTime } from 'rxjs';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { add } from 'date-fns';

@Component({
  selector: 'one-portal-list-vlan',
  templateUrl: './list-vlan.component.html',
  styleUrls: ['./list-vlan.component.less'],
})
export class ListVlanComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  typeVPC: number

  value: string


  response: BaseResponse<NetWorkModel[]>

  pageSize: number = 10
  pageNumber: number = 1

  isLoading: boolean = false

  validateForm: FormGroup<{
    nameNetwork: FormControl<string>
  }> = this.fb.group({
    nameNetwork: ['', [Validators.required,
      AppValidator.startsWithValidator('vlan_'),
      Validators.maxLength(50),
      Validators.pattern(/^[a-zA-Z0-9_]*$/)]]
  });

  isBegin: boolean = false
  constructor(private vlanService: VlanService,
              private router: Router,
              private route: ActivatedRoute,
              private notification: NzNotificationService,
              private fb: NonNullableFormBuilder) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
    // this.getListVlanNetwork()
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
    this.typeVPC = project?.type

    this.getListVlanNetwork(true)
  }

  onInputChange() {
    this.value = this.value.trim();
    this.getListVlanNetwork(false)
  }

  navigateToCreateNetwork() {
    this.router.navigate(['/app-smart-cloud/vlan/create/network'])
  }


  onPageSizeChange(value) {
    this.pageSize = value
    this.getListVlanNetwork(false)
  }

  onPageIndexChange(value) {
    this.pageNumber = value
    this.getListVlanNetwork(false)
  }

  getListVlanNetwork(isCheckBegin) {
    this.isLoading = true

    let formSearchNetwork: FormSearchNetwork = new FormSearchNetwork()
    formSearchNetwork.vlanName = this.value
    formSearchNetwork.region = this.region
    formSearchNetwork.pageSize = this.pageSize
    formSearchNetwork.pageNumber = this.pageNumber
    formSearchNetwork.project = this.project

    this.vlanService.getVlanNetworks(formSearchNetwork)
      .pipe(debounceTime(500))
      .subscribe(data => {
      this.response = data
      this.isLoading = false
      if (isCheckBegin) {
        this.isBegin = this.response?.records === null || this.response?.records.length < 1 ? true : false;
      }
    }, error => {
        this.response = null
        this.isLoading = false
        this.notification.error(error.statusText, 'Lấy dữ liệu thất bại')
      })
  }

  handleOkEdit() {
    this.getListVlanNetwork(false)
  }

  handleOkDelete(){
    this.getListVlanNetwork(false)
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
    this.vlanService.model.subscribe(data => {
      console.log(data)
    })
    // this.getListVlanNetwork()
  }

  protected readonly add = add;
}
