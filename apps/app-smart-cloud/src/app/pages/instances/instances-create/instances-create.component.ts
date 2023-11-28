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
  SHHKeyModel,
  SecurityGroupModel,
  Snapshot,
} from '../instances.model';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { InstancesService } from '../instances.service';
import { da, tr } from 'date-fns/locale';
import { Observable, finalize } from 'rxjs';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { RegionModel } from 'src/app/shared/models/region.model';
import { LoadingService } from '@delon/abc/loading';

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
  id: number = 0;
  ip?: string = '';
  amount?: number = 0;
  ipv6?: boolean = false;
  price?: string = '000';
}

@Component({
  selector: 'one-portal-instances-create',
  templateUrl: './instances-create.component.html',
  styleUrls: ['../instances-list/instances.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstancesCreateComponent implements OnInit {
  reverse = true;
  form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    // items: new FormArray<FormGroup<InstancesForm>>([]),
  });

  //danh sách các biến của form model
  createInstances: CreateInstances = new CreateInstances();
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
  hdh: any = null;
  flavor: any = null;
  flavorCloud: any;
  configCustom: ConfigCustom = new ConfigCustom(); //cấu hình tùy chỉnh
  selectedSSHKeyId: string = '';
  selectedSnapshot: number;

  //#region Hệ điều hành
  listImageTypes: ImageTypesModel[] = [];
  listImageVersionByType: Images[] = [];
  selectedValueVersion: any;
  isLoading = false;
  selectedTypeImageId: number;
  pagedCardListImages: Array<Array<any>> = [];

  getAllImageType() {
    this.dataService.getAllImageType().subscribe((data: any) => {
      this.listImageTypes = data;
      for (let i = 0; i < this.listImageTypes.length; i += 4) {
        this.pagedCardListImages.push(this.listImageTypes.slice(i, i + 4));
      }
    });
  }

  getAllImageVersionByType(type: number) {
    this.dataService
      .getAllImage(null, this.region, type, this.customerId)
      .subscribe((data: any) => {
        this.listImageVersionByType = data;
      });
  }

  onInputHDH(index: number, event: any) {
    this.hdh = this.listImageVersionByType.find((x) => (x.id = event));
    this.selectedTypeImageId = this.hdh.imageTypeId;
  }

  //#endregion

  //#region  Snapshot
  isSnapshot: boolean = true;
  listImages: Images[] = [];
  listSnapshot: Snapshot[] = [];

  initSnapshot(): void {
    if (this.isSnapshot) {
      this.dataService
        .getAllSnapshot('', '', this.region, this.customerId)
        .subscribe((data: any) => {
          this.listSnapshot = data;
        });
    }
  }

  onChangeSnapshot(event?: any) {
    this.selectedSnapshot = event;
  }

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
  getAllIPPublic() {
    this.dataService
      .getAllIPPublic(this.region, this.customerId, 0, 9999, 1, false, '')
      .subscribe((data: any) => {
        this.listIPPublic = data.records;
      });
  }

  getAllSecurityGroup() {
    this.dataService
      .getAllSecurityGroup(this.region, this.userId, this.projectId)
      .subscribe((data: any) => {
        this.listSecurityGroup = data;
      });
  }

  //#endregion

  //#region Gói cấu hình/ Cấu hình tùy chỉnh
  activeBlockFlavors: boolean = true;
  activeBlockFlavorCloud: boolean = false;
  listFlavors: Flavors[] = [];
  pagedCardList: Array<Array<any>> = [];
  effect = 'scrollx';

  selectedElementFlavor: string = null;
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
  toggleClass(id: string) {
    this.selectedElementFlavor = id;
    if (this.selectedElementFlavor) {
      this.isInitialClass = !this.isInitialClass;
      this.isNewClass = !this.isNewClass;
    } else {
      this.isInitialClass = true;
      this.isNewClass = false;
    }

    this.cdr.detectChanges();
  }

  selectElementInputFlavors(id: string) {
    this.selectedElementFlavor = id;
  }
  //#endregion

  //#region selectedPasswordOrSSHkey
  listSSHKey: SHHKeyModel[] = [];
  activeBlockPassword: boolean = true;
  activeBlockSSHKey: boolean = false;

  initPassword(): void {
    this.activeBlockPassword = true;
    this.activeBlockSSHKey = false;
  }
  initSSHkey(): void {
    this.activeBlockPassword = false;
    this.activeBlockSSHKey = true;
    this.getAllSSHKey();
  }

  getAllSSHKey() {
    this.listSSHKey = [];
    this.dataService
      .getAllSSHKey(this.projectId, this.region, this.customerId, 999999, 0)
      .subscribe((data: any) => {
        data.records.forEach((e) => {
          const itemMapper = new SHHKeyModel();
          itemMapper.id = e.id;
          itemMapper.displayName = e.name;
          this.listSSHKey.push(itemMapper);
        });
      });
  }

  onSSHKeyChange(event?: any) {
    this.selectedSSHKeyId = event;
    console.log('sshkey', event);
  }

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
  deleteRowNetwork(id: number): void {
    this.listOfDataNetwork = this.listOfDataNetwork.filter((d) => d.id !== id);
  }

  onInputNetwork(index: number, event: any) {
    // const inputElement = this.renderer.selectRootElement('#type_' + index);
    // const inputValue = inputElement.value;
    // Sử dụng filter() để lọc các object có trường 'type' khác rỗng
    const filteredArray = this.listOfDataNetwork.filter(
      (item) => item.ip !== ''
    );
    const filteredArrayHas = this.listOfDataNetwork.filter(
      (item) => item.ip == ''
    );

    if (filteredArrayHas.length > 0) {
      this.listOfDataNetwork[index].ip = event;
    } else {
      // Add a new row with the same value as the current row
      //const currentItem = this.itemsTest[count];
      //this.itemsTest.splice(count + 1, 0, currentItem);
      this.defaultNetwork = new Network();
      this.idNetwork++;
      this.defaultNetwork.id = this.idNetwork;
      this.listOfDataNetwork.push(this.defaultNetwork);
    }
    this.cdr.detectChanges();
  }
  //#endregion

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private dataService: InstancesService,
    private modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    public message: NzMessageService,
    private renderer: Renderer2,
    private loadingSrv: LoadingService
  ) {}
  onRegionChange(region: RegionModel) {
    // Handle the region change event
    this.region = region.regionId;
    console.log(this.tokenService.get()?.userId);
    this.listSecurityGroup = [];
    this.listIPPublic = [];
    this.selectedSecurityGroup = [];
    this.ipPublicValue = '';
    this.initSnapshot();
    this.getAllSSHKey();
    this.getAllIPPublic();
    this.getAllSecurityGroup();
    this.cdr.detectChanges();
  }

  onProjectChange(project: any) {
    // Handle the region change event
    this.projectId = project.id;
    this.listSecurityGroup = [];
    this.selectedSecurityGroup = [];
    this.getAllSecurityGroup();
    this.getAllSSHKey();
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.userId = this.tokenService.get()?.userId;
    this.getAllImageType();
    this.initFlavors();
    this.getAllIPPublic();
    this.getAllSecurityGroup();
  }

  createInstancesForm(): FormGroup<InstancesForm> {
    return new FormGroup({
      name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });
  }

  // get items(): FormArray<FormGroup<InstancesForm>> {
  //   return this.form.controls.items;
  // }

  save(): void {
    let arraylistSecurityGroup = null;
    // if (this.selectedSecurityGroup.length > 0) {
    //   arraylistSecurityGroup = this.selectedSecurityGroup.map((obj) =>
    //     obj.id.toString()
    //   );
    // }
    if (!this.isSnapshot && this.hdh == null) {
      this.message.error('Vui lòng chọn hệ điều hành');
      return;
    }
    if (this.flavor == null) {
      this.message.error('Vui lòng chọn gói cấu hình');
      return;
    }
    this.createInstances.regionId = 5; // this.region;
    this.createInstances.projectId = 4082; // this.projectId;
    this.createInstances.customerId = 669; // this.customerId;
    // this.createInstances.imageId = this.selectedSnapshot;
    this.createInstances.imageId = 132;
    this.createInstances.useIPv6 = false;
    this.createInstances.usePrivateNetwork = true //his.isUseLAN;
    this.createInstances.currentNetworkCloudId = null;
      //'113210e5-52ac-4c01-a7bf-0976eca0c81f';
    this.createInstances.flavorId = 2446; //this.flavor.id;
    this.createInstances.storage = 1;
    this.createInstances.snapshotCloudId = null;
    this.createInstances.listSecurityGroup = null //arraylistSecurityGroup;
    this.createInstances.keypair = null //this.selectedSSHKeyId;
    this.createInstances.domesticBandwidth = 5;
    this.createInstances.intenationalBandwidth = 10;
    this.createInstances.ramAdditional = 0;
    this.createInstances.cpuAdditional = 0;
    this.createInstances.btqtAdditional = 0;
    this.createInstances.bttnAdditional = 0;
    this.createInstances.initPassword = '123123aA@'; //this.password;
    this.createInstances.ipPrivate = null;

    this.loadingSrv.open({type: "spin", text: "Loading..."});

    this.dataService.create(this.createInstances)
    .pipe(finalize(() => {
      this.loadingSrv.close();
    }))
    .subscribe(
      (data: any) => {
        console.log(data);
        this.message.success('Tạo mới máy ảo thành công');
        this.router.navigateByUrl(`/app-smart-cloud/instances`)
      },
      (error) => {
        console.log(error.error);
        this.message.error('Tạo mới máy ảo không thành công');
      }
    );
  }

  cancel(): void {
    this.router.navigate(['/app-smart-cloud/instances']);
  }

  _submitForm(): void {
    // this.formValidity(this.form.controls);
    // if (this.form.invalid) {
    //   return;
    // }
    this.save();
  }

  private formValidity(controls: NzSafeAny): void {
    Object.keys(controls).forEach((key) => {
      const control = (controls as NzSafeAny)[key] as AbstractControl;
      control.markAsDirty();
      control.updateValueAndValidity();
    });
  }
}
