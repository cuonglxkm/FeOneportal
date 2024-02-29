import {Component, OnInit} from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {FormSearchNetwork, NetWorkModel} from "../../../shared/models/vlan.model";
import { AppValidator, BaseResponse } from '../../../../../../../libs/common-utils/src';
import {VlanService} from "../../../shared/services/vlan.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ProjectService} from "../../../shared/services/project.service";
import {getCurrentRegionAndProject} from "@shared";
import { debounceTime } from 'rxjs';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'one-portal-list-vlan',
  templateUrl: './list-vlan.component.html',
  styleUrls: ['./list-vlan.component.less'],
})
export class ListVlanComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  typeVPC: number

  value: string

  formSearchNetwork: FormSearchNetwork = new FormSearchNetwork()

  response: BaseResponse<NetWorkModel[]>

  pageSize: number = 10
  pageNumber: number = 1

  isLoading: boolean = false

  isVisibleEditNetwork: boolean = false
  isLoadingEditNetwork: boolean = false

  isVisibleDeleteNetwork: boolean = false
  isLoadingDeleteNetwork: boolean = false

  validateForm: FormGroup<{
    nameNetwork: FormControl<string>
  }> = this.fb.group({
    nameNetwork: ['', [Validators.required,
      AppValidator.startsWithValidator('vlan_'),
      Validators.maxLength(50),
      Validators.pattern(/^[a-zA-Z0-9_]*$/)]]
  });
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

    this.getListVlanNetwork()
  }

  onInputChange(value) {
    this.value = value

    this.getListVlanNetwork()
  }

  navigateToCreateNetwork() {
    this.router.navigate(['/app-smart-cloud/vlan/create/network'])
  }

  networkInit(){
    this.formSearchNetwork.vlanName = this.value
    this.formSearchNetwork.region = this.region
    this.formSearchNetwork.pageSize = this.pageSize
    this.formSearchNetwork.pageNumber = this.pageNumber
  }

  onPageSizeChange(value) {
    this.pageSize = value
    this.getListVlanNetwork()
  }

  onPageIndexChange(value) {
    this.pageNumber = value
    this.getListVlanNetwork()
  }

  getListVlanNetwork() {
    this.isLoading = true
    this.networkInit()
    this.vlanService.getVlanNetworks(this.formSearchNetwork)
      .pipe(debounceTime(500))
      .subscribe(data => {
      this.response = data
      this.isLoading = false
    })
  }

  idNetwork: number
  nameNetwork: string

  showModalEditNetwork(id: number, name: string) {
    this.isVisibleEditNetwork = true
    this.idNetwork = id
    this.validateForm.controls.nameNetwork.setValue(name)
  }

  handleCancelEdit() {
    this.isVisibleEditNetwork = false
  }

  handleOkEdit() {
    if(this.validateForm.valid){
      this.isLoadingEditNetwork = true
      this.vlanService.updateNetwork(this.idNetwork, this.validateForm.controls.nameNetwork.value).subscribe(data => {
        this.isLoadingEditNetwork = false
        this.isVisibleEditNetwork = false
        this.validateForm.controls.nameNetwork.setValue("")
        this.getListVlanNetwork()
        this.notification.success('Thành công', 'Chỉnh sửa Network thành công')
      }, error => {
        this.isLoadingEditNetwork = false
        this.isVisibleEditNetwork = false
        this.getListVlanNetwork()
        this.notification.error('Thất bại', 'Chỉnh sửa Network thất bại')
      })
    }
  }

  showModalDeleteNetwork(id: number, name: string) {
    this.validateForm.controls.nameNetwork.setValue("")
    this.isVisibleDeleteNetwork = true
    this.idNetwork = id
    this.nameNetwork = name
  }

  handleCancelDelete() {
    this.isVisibleDeleteNetwork = false
  }

  handleOkDelete(){
    if(this.validateForm.controls.nameNetwork.value.includes(this.nameNetwork)) {
      this.isLoadingDeleteNetwork = true
      this.vlanService.deleteNetwork(this.idNetwork).subscribe(data => {
        this.isLoadingDeleteNetwork = false
        this.isVisibleDeleteNetwork = false
        this.getListVlanNetwork()
        this.notification.success('Thành công', 'Xoá Network thành công')
      }, error => {
        this.isLoadingDeleteNetwork = false
        this.isVisibleDeleteNetwork = false
        this.getListVlanNetwork()
        this.notification.error('Thất bại', 'Xoá Network thất bại')
      })
    }
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
}
