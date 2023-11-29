import {Component, Inject, OnInit} from '@angular/core';
import {NzSelectOptionInterface} from "ng-zorro-antd/select";
import {EditSizeVolumeModel, EditTextVolumeModel, GetAllVmModel} from "../../../../shared/models/volume.model";
import {EditSizeMemoryVolumeDTO, PriceVolumeDto, VmDto} from "../../../../shared/dto/volume.dto";
import {VolumeService} from "../../../../shared/services/volume.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {VolumeDTO} from "../../../../shared/dto/volume.dto";
import {ActivatedRoute, Router} from "@angular/router";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";

@Component({
  selector: 'app-edit-volume',
  templateUrl: './edit-volume.component.html',
  styleUrls: ['./edit-volume.component.less'],
})
export class EditVolumeComponent implements OnInit {

  headerInfo = {
    breadcrumb1: 'Home',
    breadcrumb2: 'Dịch vụ',
    breadcrumb3: 'Volume',
    content: 'Chỉnh sửa Volume '
  };

  priceVolumeInfo: PriceVolumeDto = {
    price: 0,
    totalPrice: 0,
    tax: 0
  };

  getAllVmResponse: GetAllVmModel;
  listAllVMs: VmDto[] = [];

  volumeInfo: VolumeDTO;

  oldSize: number;
  oldName: string;
  oldDescription: string;


  regionIdSearch: number;
  projectIdSearch: number;

  vmList: NzSelectOptionInterface[] = [];

  snapshotList: NzSelectOptionInterface[] = [];

  expiryTime: any;
  isInitSnapshot = false;
  snapshot: any;
  protected readonly onchange = onchange;


  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService, private volumeSevice: VolumeService, private nzMessage: NzMessageService, private activatedRoute: ActivatedRoute, private router: Router) {
  }

  async ngOnInit(): Promise<void> {

    const idVolume = this.activatedRoute.snapshot.paramMap.get('id');
    this.getVolumeById(idVolume);


    let userId = this.tokenService.get()?.userId;
    this.getAllVmResponse = await this.volumeSevice.getListVM(userId, this.regionIdSearch).toPromise();
    this.listAllVMs = this.getAllVmResponse.records;
    this.listAllVMs.forEach((vm) => {
      this.vmList.push({value: vm.id, label: vm.name});
    })

  }

  private getVolumeById(idVolume: string) {
    this.volumeSevice.getVolummeById(idVolume).subscribe(data => {
      if (data !== undefined && data != null) {
        this.volumeInfo = data;
        this.oldSize = data.sizeInGB;


        //Thoi gian su dung
        const createDate = new Date(this.volumeInfo.creationDate);
        const exdDate = new Date(this.volumeInfo.expirationDate);
        this.expiryTime = (exdDate.getFullYear() - createDate.getFullYear()) * 12 + (exdDate.getMonth() - createDate.getMonth());

      } else {

      }

    })
  }

  changeVolumeType() {
    this.nzMessage.create('warning', 'Không thể thay đổi loại Volume.')
  }

  getProjectId(projectId: number) {
    this.projectIdSearch = projectId;
  }

  async getRegionId(regionId: number) {
    this.regionIdSearch = regionId;

    this.vmList = [];
    let userId = this.tokenService.get()?.userId;
    this.getAllVmResponse = await this.volumeSevice.getListVM(userId, this.regionIdSearch).toPromise();
    this.listAllVMs = this.getAllVmResponse.records;
    this.listAllVMs.forEach((vm) => {
      this.vmList.push({value: vm.id, label: vm.name});
    })
  }

  editVolume() {
    if (this.oldSize !== this.volumeInfo.sizeInGB) {
      console.log('Call API Create.')
      this.doEditSizeVolume();
    } else {
      console.log('Call API PUT')
      this.doEditTextVolume();
    }
  }

  async doEditTextVolume() {
    let request = new EditTextVolumeModel();
    request.volumeId = this.volumeInfo.id;
    request.newDescription = this.volumeInfo.description;
    request.newName = this.volumeInfo.name;
    let response = this.volumeSevice.editTextVolume(request).toPromise();
    if (await response == true) {
      this.nzMessage.create('success', 'Chỉnh sửa thông tin Volume thành công.');
      this.router.navigate(['/app-smart-cloud/volume']);
    } else
      return false;

  }

  private doEditSizeVolume() {
    let editVolumeDto = new EditSizeMemoryVolumeDTO();
    editVolumeDto.serviceInstanceId = this.volumeInfo.id;
    editVolumeDto.newDescription = this.volumeInfo.description;
    editVolumeDto.regionId = this.volumeInfo.regionId;
    editVolumeDto.newSize = this.volumeInfo.sizeInGB
    editVolumeDto.newOfferId = 0;
    editVolumeDto.serviceName = this.volumeInfo.name;
    editVolumeDto.vpcId = this.volumeInfo.vpcId;
    editVolumeDto.customerId = this.tokenService.get()?.userId;
    editVolumeDto.typeName = "SharedKernel.IntegrationEvents.Orders.Specifications.VolumeResizeSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null";
    const userString = localStorage.getItem('user');
    const user = JSON.parse(userString);
    editVolumeDto.actorEmail = user.email;
    editVolumeDto.userEmail = user.email;
    editVolumeDto.serviceType = 2;
    editVolumeDto.actionType = 1;

    let request = new EditSizeVolumeModel();
    request.customerId = editVolumeDto.customerId;
    request.createdByUserId = editVolumeDto.customerId;
    request.note = 'update volume';
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(editVolumeDto),
        specificationType: 'volume_resize',
        price: this.priceVolumeInfo.price,
        serviceDuration: this.expiryTime
      }
    ]
    let reponse = this.volumeSevice.editSizeVolume(request).subscribe(data => {
        if (data != null) {
          this.nzMessage.create('success', 'Chỉnh sửa Volume thành công.')
          console.log(data);
          this.router.navigate(['/app-smart-cloud/volume']);
        }
      }
    );

  }

  getPremiumVolume(size: number) {

    if (size !== undefined && size != null) {


      this.volumeSevice.getPremium(this.volumeInfo.volumeType, size, this.expiryTime).subscribe(data => {
        if (data != null) {
          this.nzMessage.create('success', 'Phí đã được cập nhật.')
          this.priceVolumeInfo = data;
        }
      })
    }
  }


}
