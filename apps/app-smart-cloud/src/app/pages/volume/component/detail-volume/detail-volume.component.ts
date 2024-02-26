import {Component, Inject, OnInit} from '@angular/core';
import {AttachedDto, ExtendVolumeDTO, VolumeDTO} from "../../../../shared/dto/volume.dto";
import {VolumeService} from "../../../../shared/services/volume.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NzMessageService} from "ng-zorro-antd/message";
import {NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {PopupExtendVolumeComponent} from "../popup-volume/popup-extend-volume.component";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {EditSizeVolumeModel} from "../../../../shared/models/volume.model";
import {RegionModel} from "../../../../shared/models/region.model";
import {ProjectModel} from "../../../../shared/models/project.model";
import { ProjectService } from 'src/app/shared/services/project.service';
import {getCurrentRegionAndProject} from "@shared";

@Component({
  selector: 'app-detail-volume',
  templateUrl: './detail-volume.component.html',
  styleUrls: ['./detail-volume.component.less'],
})
export class DetailVolumeComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  headerInfo = {
    breadcrumb1: 'Home',
    breadcrumb2: 'Dịch vụ',
    breadcrumb3: 'Volume',
    content: 'Chi tiết Volume '
  };

  volumeInfo: VolumeDTO = new VolumeDTO();

  attachedDto: AttachedDto[] = [];

  listVMs: string = '';

  isLoading: boolean = false;

  typeVPC: number
  regionChanged(region: RegionModel) {
    // this.region = region.regionId
    // this.projectService.getByRegion(this.region).subscribe(data => {
    //   if (data.length){
    //     localStorage.setItem("projectId", data[0].id.toString())
        this.router.navigate(['/app-smart-cloud/volumes'])
    //   }
    // });
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
    this.typeVPC = project.type

    // this.router.navigate(['/app-smart-cloud/volumes'])
    // this.getListVolumes()
  }
  userChangeProject(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/volumes'])
    //
  }
  loadProjects() {
    this.projectService.getByRegion(this.region).subscribe(data => {
      let project = data.find(project => project.id === +this.project);
      if (project) {
        this.typeVPC = project.type
      }
    });
  }

  ngOnInit(): void {
    const idVolume = this.activatedRoute.snapshot.paramMap.get('id');
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
    // this.customerId = this.tokenService.get()?.userId
    if (this.project && this.region) {
      this.loadProjects()
    }
    this.getVolumeById(Number.parseInt(idVolume));
  }

  onModelChange() {

  }

  getVolumeById(idVolume: number) {
    this.isLoading = true;
    this.volumeSevice.getVolumeById(idVolume).subscribe(data => {
        this.isLoading = false;
        console.log('data get volume by id', data)
        this.volumeInfo = data;
        if (data.attachedInstances != null) {
          this.attachedDto = data.attachedInstances;
        }

        if (this.attachedDto.length > 0) {
          this.attachedDto.forEach(vm => {
            this.listVMs += vm.instanceName + '\n';
          })
        }
      }, error => {
        this.isLoading = false;
      }
    )
  }

  openPopupExtend() {
    const modal: NzModalRef = this.modalService.create({
      nzTitle: 'Gia hạn Volume',
      nzContent: PopupExtendVolumeComponent,
      nzFooter: [
        {
          label: 'Hủy',
          type: 'default',
          onClick: () => modal.destroy()
        },
        {
          label: 'Đồng ý',
          type: 'primary',
          onClick: () => {
            this.doExtendVolume();
            modal.destroy()
          }
        }
      ]
    });
  }

  private doExtendVolume() {
    this.isLoading = true;
    //Tính thời hạn sử dụng khi tạo volume
    let createDate = new Date(this.volumeInfo.creationDate);
    let expDate = new Date(this.volumeInfo.expirationDate);
    console.log('old ExpDate: ' + expDate);
    let expiryTime = (expDate.getFullYear() - createDate.getFullYear()) * 12 + (expDate.getMonth() - createDate.getMonth());
    // Gia hạn bằng thời hạn sử dụng khi tạo.
    expDate.setMonth(expDate.getMonth() + expiryTime);

    //Call API gia hạn
    let extendsDto = new ExtendVolumeDTO();
    extendsDto.newExpireDate = expDate.toISOString();
    extendsDto.serviceInstanceId = this.volumeInfo.id;
    extendsDto.regionId = this.volumeInfo.regionId;
    extendsDto.serviceName = this.volumeInfo.name;
    extendsDto.vpcId = this.volumeInfo.vpcId;
    extendsDto.customerId = this.tokenService.get()?.userId;
    extendsDto.typeName = "SharedKernel.IntegrationEvents.Orders.Specifications.VolumeResizeSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null";
    const userString = localStorage.getItem('user');
    const user = JSON.parse(userString);
    extendsDto.actorEmail = user.email;
    extendsDto.userEmail = user.email;
    extendsDto.serviceType = 2;
    extendsDto.actionType = 1;

    let request = new EditSizeVolumeModel();
    request.customerId = extendsDto.customerId;
    request.createdByUserId = extendsDto.customerId;
    request.note = 'extend volume';
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(extendsDto),
        specificationType: 'volume_extend',
        price: 100000,
        serviceDuration: expiryTime
      }
    ]

    let reponse = this.volumeSevice.extendsVolume(request).subscribe(
      data => {
        this.nzMessage.create('success', 'Gia hạn Volume thành công.')
        this.isLoading = false

      }, error => {
        this.nzMessage.create('error', 'Gia hạn Volume không thành công.')
        this.isLoading = false
      }
    );

  }

  navigateEditVolume(idVolume: number) {
    this.router.navigate(['/app-smart-cloud/volume/edit/' + idVolume]);
  }

  navigateToRenew(idVolume: number) {
    this.router.navigate(['/app-smart-cloud/volumes/renew/' + idVolume])
  }

  navigateToResizeVPC(idVolume: number) {
    this.router.navigate(['/app-smart-cloud/volume/vpc/resize/' + idVolume])
  }

  volumeStatus: Map<String, string>;

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private volumeSevice: VolumeService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private nzMessage: NzMessageService,
              private modalService: NzModalService,
              private projectService: ProjectService) {
    this.volumeStatus = new Map<String, string>();
    this.volumeStatus.set('KHOITAO', 'ĐANG HOẠT ĐỘNG');
    this.volumeStatus.set('ERROR', 'LỖI');
    this.volumeStatus.set('SUSPENDED', 'TẠM NGƯNG');
  }

}
