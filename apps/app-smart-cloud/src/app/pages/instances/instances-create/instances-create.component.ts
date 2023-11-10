import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
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
  ImageTypesModel,
  Images,
  InstancesModel,
  SecurityGroupModel,
  Snapshot,
} from '../instances.model';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { VMService } from '../instances.service';
import { da, tr } from 'date-fns/locale';
import { NguCarouselConfig } from '@ngu/carousel';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Observable } from 'rxjs';

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
  styleUrls: ['./instances-create.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstancesCreateComponent implements OnInit {
  listOfOption: Array<{ value: string; label: string }> = [];
  listOfSelectedValue = ['a10', 'c12'];

  radioValue = 'A';
  reverse = true;
  editIndex = -1;
  editObj = {};
  form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    // items: new FormArray<FormGroup<InstancesForm>>([]),
  });
  users: Array<{ value: string; label: string }> = [
    { value: 'xiao', label: '付晓晓' },
    { value: 'mao', label: '周毛毛' },
  ];

  //danh sách các biến của form model
  createInstances: CreateInstances = new CreateInstances();
  region: number = 3;
  projectId: number = 310;
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
  configCustom: ConfigCustom = new ConfigCustom(); //cấu hình tùy chỉnh

  //#region Hệ điều hành
  listImageTypes: ImageTypesModel[] = [];
  listImageVersionByType: Images[] = [];
  selectedValueVersion: any;
  isLoading = false;

  getAllImageType() {
    this.dataService.getAllImageType().subscribe((data: any) => {
      this.listImageTypes = data;
      // for (var i = 0; i < this.listImageTypes.length; i++) {
      //   this.dataService
      //     .getAllImage(
      //       null,
      //       this.region,
      //       this.listImageTypes[i].id,
      //       this.customerId
      //     )
      //     .subscribe((dataimage: any) => {
      //       this.listImageTypes[i].items = dataimage;
      //     });
      // }
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
  }

  //#endregion

  //#region  Snapshot
  isSnapshot: boolean = false;
  listImages: Images[] = [];
  listSnapshot: Snapshot[] = [];

  initSnapshot(): void {
    if (this.isSnapshot) {
      this.dataService
        .getAllSnapshot(null, this.region, null, null)
        .subscribe((data: any) => {
          this.listSnapshot = data;
        });
    } else {
      this.dataService
        .getAllImage(null, this.region, null, null)
        .subscribe((data: any) => {
          this.listImages = data;
        });
    }
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
        this.selectedSecurityGroup.push(this.listSecurityGroup[0]);
      });
  }

  //#endregion

  //#region Gói cấu hình/ Cấu hình tùy chỉnh
  activeBlockFlavors: boolean = true;
  activeBlockFlavorCloud: boolean = false;
  listFlavors: Flavors[] = [];
  pagedCardList: Array<Array<any>> = [];
  effect = 'scrollx';

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
  //#endregion

  //#region selectedPasswordOrSSHkey
  activeBlockPassword: boolean = true;
  activeBlockSSHKey: boolean = false;

  initPassword(): void {
    this.activeBlockPassword = true;
    this.activeBlockSSHKey = false;
  }
  initSSHkey(): void {
    this.activeBlockPassword = false;
    this.activeBlockSSHKey = true;
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
  initNetwork(): void {
    this.activeNetwork = true;
    this.listOfDataNetwork.push(this.defaultNetwork);
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
    private dataService: VMService,
    private modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    public message: NzMessageService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.getAllImageType();
    this.initFlavors();
    this.getAllIPPublic();
    this.getAllSecurityGroup();
    const userList = [
      {
        key: '1',
        workId: '00001',
        name: 'John Brown',
        department: 'New York No. 1 Lake Park',
      },
      {
        key: '2',
        workId: '00002',
        name: 'Jim Green',
        department: 'London No. 1 Lake Park',
      },
      {
        key: '3',
        workId: '00003',
        name: 'Joe Black',
        department: 'Sidney No. 1 Lake Park',
      },
    ];

    const children: string[] = [];
    for (let i = 10; i < 10000; i++) {
      children.push(`${i.toString(36)}${i}`);
    }
    this.listOfOption = children.map((item) => ({
      value: item,
      label: item,
    }));
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
    this.createInstances.regionId= this.region
    this.createInstances.projectId=this.projectId
    this.createInstances.customerId=this.customerId
    this.createInstances.imageId= this.hdh.id
    this.dataService.create(this.createInstances).subscribe(
      (data: any) => {
        console.log(data);
        this.message.success('Tạo mới máy ảo thành công');
      },
      (error) => {
        console.log(error.error);
        this.message.error('Tạo mới máy ảo không thành công');
      }
    );
  }

  cancel(): void {
    this.ngOnInit();
  }

  _submitForm(): void {
    this.formValidity(this.form.controls);
    if (this.form.invalid) {
      return;
    }
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
