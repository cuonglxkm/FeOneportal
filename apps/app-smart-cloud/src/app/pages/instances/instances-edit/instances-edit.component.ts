import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  Renderer2,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import {
  CreateInstances,
  Flavors,
  IPPublicModel,
  IPSubnetModel,
  ImageTypesModel,
  Images,
  InstancesModel,
  SecurityGroupModel,
  Snapshot,
  UpdateInstances,
} from '../instances.model';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { InstancesService } from '../instances.service';
import { da, tr } from 'date-fns/locale';
import { Observable } from 'rxjs';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { RegionModel } from 'src/app/shared/models/region.model';

interface InstancesForm {
  name: FormControl<string>;
}
class ConfigCustom {
  //cấu hình tùy chỉnh
  vCPU?: number = 0;
  ram?: number = 0;
  capacity?: number = 0;
  iops?: string = '000';
  priceHour?: string = '000';
  priceMonth?: string = '000';
}
class BlockStorage {
  id: number = 0;
  type?: string = '';
  name?: string = '';
  vCPU?: number = 0;
  ram?: number = 0;
  capacity?: number = 0;
  code?: boolean = false;
  multiattach?: boolean = false;
  price?: string = '000';
}
class Network {
  name?: string = 'pri_network';
  mac?: string = '';
  ip?: string = '';
  status?: string = '';
}


@Component({
  selector: 'one-portal-instances-edit',
  templateUrl: './instances-edit.component.html',
  styleUrls: ['../instances-list/instances.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstancesEditComponent implements OnInit {
  listOfOption: Array<{ value: string; label: string }> = [];
  reverse = true;
  form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    // items: new FormArray<FormGroup<InstancesForm>>([]),
  });

  //danh sách các biến của form model
  id: number;
  instancesModel: InstancesModel;

  updateInstances: UpdateInstances = new UpdateInstances();
  region: number = 3;
  projectId: number = 4079;
  customerId: number = 669;
  userId: number = 669;
  today: Date = new Date();
  ipPublicValue: string = '';
  isUseIPv6: boolean = false;
  isUseLAN: boolean = false;
  passwordVisible = false;
  password?: string;
  numberMonth: number = 1;
  hdh: any;
  flavor: any;
  flavorCloud: any;
  configCustom: ConfigCustom = new ConfigCustom(); //cấu hình tùy chỉnh

  //#region Hệ điều hành

  //#endregion

  //#region  Snapshot

  //#endregion

  //#region HDD hay SDD
  activeBlockHDD: boolean = true;
  activeBlockSSD: boolean = false;

  initHDD(): void {
    this.activeBlockHDD = true;
    this.activeBlockSSD = false;
  }
  initSSD(): void {
    this.activeBlockHDD = false;
    this.activeBlockSSD = true;
  }
  //#endregion

  //#region Chọn IP Public Chọn Security Group
  listIPPublic: IPPublicModel[] = [];
  listSecurityGroup: SecurityGroupModel[] = [];
  listIPPublicDefault: [{ id: ''; ipAddress: 'Mặc định' }];
  selectedSecurityGroup: any[] = [];

  getAllSecurityGroup() {
    this.dataService
      .getAllSecurityGroup(this.region, this.userId, this.projectId)
      .subscribe((data: any) => {
        console.log('getAllSecurityGroup', data);
        this.listSecurityGroup = data;
        //this.selectedSecurityGroup.push(this.listSecurityGroup[0]);
      });
  }
  onChangeSecurityGroup(even?: any) {
    console.log(even);
    console.log('selectedSecurityGroup', this.selectedSecurityGroup);
  }

  //#endregion

  //#region Gói cấu hình/ Cấu hình tùy chỉnh
  activeBlockFlavors: boolean = true;
  activeBlockFlavorCloud: boolean = false;
  listFlavors: Flavors[] = [];
  pagedCardList: Array<Array<any>> = [];
  effect = 'scrollx';

  selectedElementFlavor: number = null;
  isInitialClass = true;
  isNewClass = false;

  initFlavors(): void {
    this.activeBlockFlavors = true;
    this.activeBlockFlavorCloud = false;
    this.dataService
      .getAllFlavors(false, this.region, false, false, true)
      .subscribe((data: any) => {
        this.listFlavors = data;
        // Divide the cardList into pages with 4 cards per page
        for (let i = 0; i < this.listFlavors.length; i += 4) {
          this.pagedCardList.push(this.listFlavors.slice(i, i + 4));
        }
      });
  }

  initFlavorCloud(): void {
    this.activeBlockFlavors = false;
    this.activeBlockFlavorCloud = true;
  }

  onInputFlavors(event: any) {
    this.flavor = this.listFlavors.find((flavor) => flavor.id === event);
    console.log(this.flavor);
  }
  // toggleClass(id: string) {
  //   this.selectedElementFlavor = id;
  //   if (this.selectedElementFlavor) {
  //     this.isInitialClass = !this.isInitialClass;
  //     this.isNewClass = !this.isNewClass;
  //   } else {
  //     this.isInitialClass = true;
  //     this.isNewClass = false;
  //   }

  //   this.cdr.detectChanges();
  // }

  selectElementInputFlavors(id: any) {
    this.selectedElementFlavor = id;
  }
  //#endregion

  //#region selectedPasswordOrSSHkey

  //#endregion

  //#region BlockStorage
  activeBlockStorage: boolean = false;
  idBlockStorage = 0;
  listOfDataBlockStorage: BlockStorage[] = [];
  defaultBlockStorage: BlockStorage = new BlockStorage();
  typeBlockStorage: Array<{ value: string; label: string }> = [
    { value: 'HDD', label: 'HDD' },
    { value: 'SSD', label: 'SSD' },
  ];

  initBlockStorage(): void {
    this.activeBlockStorage = true;
    this.listOfDataBlockStorage.push(this.defaultBlockStorage);
  }
  deleteRowBlockStorage(id: number): void {
    this.listOfDataBlockStorage = this.listOfDataBlockStorage.filter(
      (d) => d.id !== id
    );
  }

  onInputBlockStorage(index: number, event: any) {
    // const inputElement = this.renderer.selectRootElement('#type_' + index);
    // const inputValue = inputElement.value;
    // Sử dụng filter() để lọc các object có trường 'type' khác rỗng
    const filteredArray = this.listOfDataBlockStorage.filter(
      (item) => item.type !== ''
    );
    const filteredArrayHas = this.listOfDataBlockStorage.filter(
      (item) => item.type == ''
    );

    if (filteredArrayHas.length > 0) {
      this.listOfDataBlockStorage[index].type = event;
    } else {
      // Add a new row with the same value as the current row
      //const currentItem = this.itemsTest[count];
      //this.itemsTest.splice(count + 1, 0, currentItem);
      this.defaultBlockStorage = new BlockStorage();
      this.idBlockStorage++;
      this.defaultBlockStorage.id = this.idBlockStorage;
      this.listOfDataBlockStorage.push(this.defaultBlockStorage);
    }
    this.cdr.detectChanges();
  }
  //#endregion
  //#region Network
  activeNetwork: boolean = false;
  idNetwork = 0;
  listOfDataNetwork: Network[] = [];
  defaultNetwork: Network = new Network();
  listIPSubnetModel: IPSubnetModel[] = [];

  initNetwork(): void {
    this.activeNetwork = true;
    this.listOfDataNetwork.push(this.defaultNetwork);

    this.dataService.getAllIPSubnet(this.region).subscribe((data: any) => {
      this.listIPSubnetModel = data;
      // var resultHttp = data;
      // this.listOfDataNetwork.push(...resultHttp);
    });
  }
 
  //#endregion

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private dataService: InstancesService,
    private modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private route: Router,
    private router: ActivatedRoute,
    public message: NzMessageService,
    private renderer: Renderer2
  ) {}
  onRegionChange(region: RegionModel) {
    // Handle the region change event
    this.region = region.regionId;
    console.log(this.tokenService.get()?.userId);
  }

  ngOnInit(): void {
    this.userId = this.tokenService.get()?.userId;
    this.initFlavors();
    this.getAllSecurityGroup();
    this.initNetwork()

    this.router.paramMap.subscribe((param) => {
      if (param.get('id') != null) {
        this.id = parseInt(param.get('id'));
        this.dataService.getById(this.id, false).subscribe((data: any) => {
          this.instancesModel = data;
          this.selectedElementFlavor = this.instancesModel.flavorId;
          this.dataService
            .getAllSecurityGroupByInstance(
              this.instancesModel.cloudId,
              this.instancesModel.regionId,
              this.instancesModel.customerId,
              this.instancesModel.projectId
            )
            .subscribe((datasg: any) => {
              console.log('getAllSecurityGroupByInstance', datasg);
              var arraylistSecurityGroup = datasg.map((obj) =>
                obj.id.toString()
              );
              this.selectedSecurityGroup = arraylistSecurityGroup;
              this.cdr.detectChanges();
            });
        });
      }
    });
  }
  navigateToCreate() {
    this.route.navigate(['/app-smart-cloud/instances/instances-create']);
  }
  navigateToChangeImage() {
    this.route.navigate(['/app-smart-cloud/instances/instances-edit-info/' + this.id]);
  }
  navigateToEdit() {
    this.route.navigate(['/app-smart-cloud/instances/instances-edit/' + this.id]);
  }
  returnPage(): void {
    this.route.navigate(['/app-smart-cloud/vm']);
  }
  
  save(): void {
    this.modalSrv.create({
      nzTitle: 'Xác nhận thông tin thay đổi',
      nzContent: 'Quý khách chắn chắn muốn thực hiện thay đổi thông tin máy ảo?',
      nzOkText: 'Đồng ý',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
       this.readyEdit()
      },
    });
  }


  readyEdit(): void {
    this.updateInstances.id = this.instancesModel.id;
    this.updateInstances.name = this.instancesModel.name;
    this.updateInstances.regionId = 3; // this.region;
    this.updateInstances.projectId = 4079; // this.projectId;
    this.updateInstances.customerId = 669; // this.customerId;
    this.updateInstances.imageId = 113; // this.hdh.id;
    this.updateInstances.flavorId = 368; //this.flavor.id;
    this.updateInstances.storage = 1;
    this.updateInstances.securityGroups = null;
    this.updateInstances.duration = null;
    this.updateInstances.listServicesToBeExtended = '';
    this.updateInstances.newExpiredDate = '';

    this.dataService.update(this.updateInstances).subscribe(
      (data: any) => {
        console.log(data);
        this.message.success('Cập nhật máy ảo thành công');
      },
      (error) => {
        console.log(error.error);
        this.message.error('Cập nhật máy ảo không thành công');
      }
    );
  }

  cancel(): void {
    this.route.navigate(['/app-smart-cloud/vm']);
  }
}
