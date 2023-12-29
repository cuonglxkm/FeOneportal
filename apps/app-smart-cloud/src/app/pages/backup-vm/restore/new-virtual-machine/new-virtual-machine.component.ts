import {Component, Inject, Input, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import Flavor from "../../../../shared/models/flavor.model";
import Image from "../../../../shared/models/image";
import {SecurityGroupSearchCondition} from "../../../../shared/models/security-group";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {BackupVmService} from "../../../../shared/services/backup-vm.service";
import {
    BackupVm,
    SecurityGroupBackup,
    SystemInfoBackup,
    VolumeAttachment,
    VolumeBackup
} from "../../../../shared/models/backup-vm";
import {InstancesService} from "../../../instances/instances.service";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {InstanceCreate, Order, OrderItem, VolumeCreate} from "../../../instances/instances.model";
import {Router} from "@angular/router";
import {formatValidator} from "@angular-devkit/schematics/src/formats/format-validator";

@Component({
    selector: 'one-portal-new-virtual-machine',
    templateUrl: './new-virtual-machine.component.html',
    styleUrls: ['./new-virtual-machine.component.less'],
})
export class NewVirtualMachineComponent implements OnInit {
    @Input() backupVmId: number
    @Input() region: number
    @Input() project: number

    validateForm: FormGroup<{
        name: FormControl<string>
        flavor: FormControl<Flavor | null>
        // image: FormControl<Image | null>
        securityGroup: FormControl<SecurityGroupBackup[]>
        iops: FormControl<number>
        storage: FormControl<number>
        radio: FormControl<any>
        volumeToBackupIds: FormControl<number[] | null>
        monthsUse: FormControl<number>
    }> = this.fb.group({
        name: ['', [Validators.required]],
        flavor: [null as Flavor | null, [Validators.required]],
        // image: [null as Image | null, [Validators.required]],
        securityGroup: [[] as SecurityGroupBackup[], [Validators.required]],
        iops: [null as number | null, [Validators.required]],
        storage: [null as number | null, [Validators.required]],
        radio: [''],
        volumeToBackupIds: [[] as number[]],
        monthsUse: [1, [Validators.required, Validators.max(24), Validators.pattern(/^[1-9]+$/)]]
    })

    conditionSearch: SecurityGroupSearchCondition = new SecurityGroupSearchCondition()
    securityGroupLst = []
    isSelectedSecurityGroup: SecurityGroupBackup
    userId: number
    backupVm: BackupVm;
    systemInfoBackups: SystemInfoBackup[] = []
    volumeBackups: VolumeBackup[] = []
    volumeAttachments: VolumeAttachment[] = []
    iops: number = 0
    storage: number = 0
    price = 0
    instanceCreate: InstanceCreate = new InstanceCreate()
    volumeCreate: VolumeCreate = new VolumeCreate()
    orderItem: OrderItem[] = []
    order: Order = new Order();


    constructor(private location: Location,
                private fb: NonNullableFormBuilder,
                @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
                private backupVmService: BackupVmService,
                private instanceService: InstancesService,
                private notification: NzNotificationService,
                private router: Router) {
    }


    goBack() {
        this.location.back();
    }

    handleFlavorChange(flavor: Flavor) {
        this.validateForm.controls.flavor.setValue(flavor)
        if (flavor) {
            this.price = flavor.price
        }
    }

    handleImageChange(image: Image) {
        // this.validateForm.controls.image.setValue(image)
    }

    getDetailBackupVM() {
        if (this.backupVmId != undefined) {
            this.backupVmService.detail(this.backupVmId).subscribe(data => {
                this.backupVm = data
                this.securityGroupLst = this.backupVm.securityGroupBackups
                this.systemInfoBackups = this.backupVm.systemInfoBackups
                this.volumeBackups = this.backupVm.volumeBackups
                console.log('backup', this.backupVm)
                console.log('systemInfo,', this.systemInfoBackups)
                console.log('volume', this.volumeBackups)
                this.volumeBackups.forEach(item => {
                    if (!item.iops) {
                        this.validateForm.controls.iops.setValue(200)
                    } else {
                        this.validateForm.controls.iops.setValue(item.iops)
                    }
                })
                if (data) {
                    this.validateForm.controls.securityGroup.setValue(data.securityGroupBackups)
                }
                this.getVolumeInstanceAttachment(this.backupVm.instanceId)
            })
        }
    }

    getVolumeInstanceAttachment(id: number) {
        this.backupVmService.getVolumeInstanceAttachment(id).subscribe(data => {
            this.volumeAttachments = data
            console.log('volume attach', this.volumeAttachments)
        })
    }

    submitForm() {
        console.log(this.validateForm);
        const now = new Date();
        const expiredDate = new Date();

        console.log('form', this.validateForm.getRawValue())

        if (this.validateForm.valid) {
            console.log('form', this.validateForm.getRawValue())
            this.instanceCreate.description = null; // this.region;
            this.instanceCreate.flavorId = this.validateForm.controls.flavor.value.id; //this.flavor.id;
            // this.instanceCreate.imageId = this.validateForm.controls.image.value.id;
            this.instanceCreate.iops = this.validateForm.controls.iops.getRawValue();
            this.instanceCreate.vmType = null;
            this.instanceCreate.keypairName = null;
            this.instanceCreate.securityGroups = this.validateForm.controls.securityGroup.value;
            this.instanceCreate.network = null;
            this.instanceCreate.volumeSize = this.validateForm.controls.storage.value;
            this.instanceCreate.isUsePrivateNetwork = true;
            this.instanceCreate.ipPublic = null;
            this.instanceCreate.password = null;
            this.instanceCreate.snapshotCloudId = null;
            this.instanceCreate.encryption = false;
            this.instanceCreate.isUseIPv6 = false;
            this.instanceCreate.addRam = this.validateForm.controls.flavor.value.ram;
            this.instanceCreate.addCpu = this.validateForm.controls.flavor.value.cpu;
            this.instanceCreate.addBttn = this.validateForm.controls.flavor.value.bttn;
            this.instanceCreate.addBtqt = this.validateForm.controls.flavor.value.btqt;
            this.instanceCreate.poolName = null;
            this.instanceCreate.usedMss = false;
            this.instanceCreate.customerUsingMss = null;
            this.instanceCreate.typeName =
                'SharedKernel.IntegrationEvents.Orders.Specifications.VolumeCreateSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null';
            this.instanceCreate.vpcId = JSON.stringify(this.project);
            this.instanceCreate.oneSMEAddonId = null;
            this.instanceCreate.serviceType = 1;
            this.instanceCreate.serviceInstanceId = 0;
            this.instanceCreate.customerId = this.userId;
            this.instanceCreate.createDate = now.toLocaleString();
            expiredDate.setMonth(now.getMonth() + 1);
            this.instanceCreate.expireDate = expiredDate.toLocaleString()
            this.instanceCreate.saleDept = null;
            this.instanceCreate.saleDeptCode = null;
            this.instanceCreate.contactPersonEmail = null;
            this.instanceCreate.contactPersonPhone = null;
            this.instanceCreate.contactPersonName = null;
            this.instanceCreate.note = null;
            this.instanceCreate.createDateInContract = null;
            this.instanceCreate.am = null;
            this.instanceCreate.amManager = null;
            this.instanceCreate.isTrial = false;
            this.instanceCreate.offerId = -2446;
            this.instanceCreate.couponCode = null;
            this.instanceCreate.dhsxkd_SubscriptionId = null;
            this.instanceCreate.dSubscriptionNumber = null;
            this.instanceCreate.dSubscriptionType = null;
            this.instanceCreate.oneSME_SubscriptionId = null;
            this.instanceCreate.actionType = 0;
            this.instanceCreate.regionId = this.region;
            this.instanceCreate.userEmail = 'toannv8@yandex.com';
            this.instanceCreate.actorEmail = 'toannv8@yandex.com';

            this.volumeBackups.forEach(item => {
                this.volumeCreate.volumeType = item.typeName;
                this.volumeCreate.volumeSize = item.size;
                this.volumeCreate.description = item.description;
                this.volumeCreate.createFromSnapshotId = null;
                this.volumeCreate.instanceToAttachId = null;
                this.volumeCreate.isMultiAttach = false;
                this.volumeCreate.isEncryption = false;
                this.volumeCreate.vpcId = this.project;
                this.volumeCreate.oneSMEAddonId = null;
                this.volumeCreate.serviceType = 2;
                this.volumeCreate.serviceInstanceId = 0;
                this.volumeCreate.customerId = this.userId;
                this.volumeCreate.createDate = now.toLocaleString();
                expiredDate.setMonth(now.getMonth() + 1);
                this.volumeCreate.expireDate = expiredDate.toLocaleString()
                this.volumeCreate.saleDept = null;
                this.volumeCreate.saleDeptCode = null;
                this.volumeCreate.contactPersonEmail = null;
                this.volumeCreate.contactPersonPhone = null;
                this.volumeCreate.contactPersonName = null;
                this.volumeCreate.note = null;
                this.volumeCreate.createDateInContract = null;
                this.volumeCreate.am = null;
                this.volumeCreate.amManager = null;
                this.volumeCreate.isTrial = false;
                this.volumeCreate.offerId = item.offerId;
                this.volumeCreate.couponCode = null;
                this.volumeCreate.dhsxkd_SubscriptionId = null;
                this.volumeCreate.dSubscriptionNumber = null;
                this.volumeCreate.dSubscriptionType = null;
                this.volumeCreate.oneSME_SubscriptionId = null;
                this.volumeCreate.actionType = 1;
                this.volumeCreate.regionId = this.region;
                this.volumeCreate.serviceName = 'volume-khaitesttaovmOrder';
                this.volumeCreate.typeName =
                    'SharedKernel.IntegrationEvents.Orders.Specifications.VolumeCreateSpecification,SharedKernel.IntegrationEvents,Version=1.0.0.0,Culture=neutral,PublicKeyToken=null';
                this.volumeCreate.userEmail = 'Khaitest';
                this.volumeCreate.actorEmail = 'Khaitest';
            })

            let orderItemInstance = new OrderItem();
            orderItemInstance.orderItemQuantity = 1;
            orderItemInstance.specification = JSON.stringify(this.instanceCreate);
            orderItemInstance.specificationType = "instance_create";
            orderItemInstance.price = this.price;
            orderItemInstance.serviceDuration = 1;
            this.orderItem.push(orderItemInstance);

            let orderItemVolume = new OrderItem();
            orderItemVolume.orderItemQuantity = this.volumeBackups.length;
            orderItemVolume.specification = JSON.stringify(this.volumeCreate);
            orderItemVolume.specificationType = "volume_create";
            orderItemVolume.price = this.price;
            orderItemVolume.serviceDuration = 1;
            this.orderItem.push(orderItemVolume);

            this.order.customerId = this.tokenService.get()?.userId;
            this.order.createdByUserId = this.tokenService.get()?.userId;
            this.order.note = "tạo vm";
            this.order.orderItems = this.orderItem;
            console.log('order', this.order)
            this.instanceService.create(this.order).subscribe(data => {
                this.notification.success('Thành công', 'Yêu cầu Restore vào máy ảo mới thành công')
                this.router.navigateByUrl(`/app-smart-cloud/instances`);
            }, error => {
                this.notification.error('Thất bại', 'Yêu cầu Restore vào máy ảo mới thất bại')
            })
        } else {
            console.log('click')
        }
    }

    ngOnInit(): void {
        this.region = JSON.parse(localStorage.getItem('region')).regionId;
        this.project = JSON.parse(localStorage.getItem('projectId'));
        this.userId = this.tokenService.get()?.userId

        this.getDetailBackupVM()
    }

}
