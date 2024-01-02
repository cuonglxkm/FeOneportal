import {Component, Inject, OnInit} from "@angular/core";
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {Router} from "@angular/router";
import {NzTableQueryParams} from "ng-zorro-antd/table";
import {SnapshotVolumeService} from "../../../shared/services/snapshot-volume.service";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {PopupAddVolumeComponent} from "../../volume/component/popup-volume/popup-add-volume.component";
import {OrderService} from "../../../shared/services/order.service";

@Component({
  selector: 'one-portal-list-order',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.less'],
})
export class OrderListComponent implements OnInit {

  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  searchStatus?: string = null
  searchName?: string;

  status = [
    {label: 'Tất cả', value: null},
    {label: 'Tạo mới ', value: '1'},
    {label: 'Đã thanh toán', value: '2'},
    {label: 'Đang khởi tạo dịch vụ ', value: '3'},
    {label: 'Hoàn thành ', value: '4'},
    {label: 'Đã hủy', value: '5'},
    {label: 'Không xác đinh', value: '6'},
    {label: 'Đã kiểm tra' , value: '7'}

  ]

  orderCode: string;

  date: any;
  pageSize: number = 5;
  currentPage: number = 1;
  listOfData: any;
  totalData: number
  isLoadingEntities:boolean;
  customerID: number;

  actionSelected: number;

  onQueryParamsChange(params: NzTableQueryParams){
    const {pageSize, pageIndex} = params;
    this.pageSize = pageSize;
    this.currentPage = pageIndex;
    this.searchSnapshotScheduleList();
  }
  searchSnapshotScheduleList(){
    this.doGetSnapSchedules(this.pageSize, this.currentPage, this.orderCode , this.customerID,
      null,null,null, null, null,null,null,this.searchStatus);
  }

  private doGetSnapSchedules(pageSize: number,
                             pageNumber: number,
                             orderCode: string,
                             customerId: number,
                             saleDept: string,
                             saleDeptCode: string,
                             seller: string,
                             ticketCode: string,
                             dSubscriptionNumber: string,
                             dSubscriptionType: string,
                             orderAfter: string,
                             resultNote: string){
    this.isLoadingEntities = true;
    this.orderService.getOrders(pageSize, pageNumber, orderCode, customerId, saleDept, saleDeptCode, seller, ticketCode, dSubscriptionNumber, dSubscriptionType, orderAfter, resultNote).subscribe(
      data => {
        this.totalData = data.totalCount;
        this.listOfData = data.records;
        this.isLoadingEntities = false;
      },
      error => {
        this.notification.error('Có lỗi xảy ra','Lấy danh sách Đơn hàng thất bại');
        this.isLoadingEntities = false;
      }
    )
  }

  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private orderService: OrderService,
              private modalService: NzModalService,
              private snapshotVolumeService: SnapshotVolumeService,
              private notification: NzNotificationService) {
  }

  ngOnInit(): void {
    this.customerID = this.tokenService.get()?.userId;
  }

  selectedActionChange(value: any, data: any){

  }

  navigateToUpdate(id: number){
    console.log(id);
  }
  showModalSuppend(id: number){
    console.log(id);
  }

  showModalDelete(id: number){
    console.log(id);
  }

  onChange(value: string) {
    this.searchStatus = value;
    this.searchSnapshotScheduleList();
  }

  onChanggeDate(value: any){
    console.log(value);
  }

  onChangeAction(value: number , id: number){
    if(value == 2){
      const modal: NzModalRef = this.modalService.create({
        nzTitle: 'Xóa lịch Snapshot',
        nzContent: `<p>Vui lòng cân nhắc thật kỹ trước khi click nút <b>Đồng ý</b>. Quý khách chắc chắn muốn thực hiện xóa lịch Snapshot?</p>`,
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
              this.doDeleteSnapshotSchedule(id);
              modal.destroy()
            }
          }
        ]
      });
    }
    if(value == 3){
      const modal: NzModalRef = this.modalService.create({
        nzTitle: 'Xóa lịch Snapshot',
        nzContent: `<p>Vui lòng cân nhắc thật kỹ trước khi click nút <b>Đồng ý</b>. Quý khách chắc chắn muốn thực hiện Tạm dừng lịch Snapshot?</p>`,
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
              this.doPauseSnapshotSchedule(id);
              modal.destroy()
            }
          }
        ]
      });
    }
    if(value == 4){
      const modal: NzModalRef = this.modalService.create({
        nzTitle: 'Xóa lịch Snapshot',
        nzContent: `<p>Vui lòng cân nhắc thật kỹ trước khi click nút <b>Đồng ý</b>. Quý khách chắc chắn muốn thực hiện Tiếp tục lịch Snapshot?</p>`,
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
              this.doResumeSnapshotSchedule(id);
              modal.destroy()
            }
          }
        ]
      });
    }
  }

  doDeleteSnapshotSchedule(id: number){
    console.log('Delete:  '+id);
  }
  doPauseSnapshotSchedule(id: number){
    this.isLoadingEntities = true;
    this.snapshotVolumeService.actionSchedule(id,'suspend',this.customerID, this.region, this.project).subscribe(
      data =>{
        if(data){
          this.notification.success('Success','Tạm dừng lịch thành công.');
          this.isLoadingEntities = false;
        }else{
          this.notification.error('Có lỗi xảy ra','Tạm dừng Entities thất bại.');
          this.isLoadingEntities = false;
        }
      }
    )
  }
  doResumeSnapshotSchedule(id: number){
    this.isLoadingEntities = true;
    this.snapshotVolumeService.actionSchedule(id,'restore',this.customerID, this.region, this.project).subscribe(
      data =>{
        if(data){
          this.notification.success('Success','Tiếp tục lịch thành công.');
          this.isLoadingEntities = false;
        }else{
          this.notification.error('Có lỗi xảy ra','Tiếp tục lịch thất bại.');
          this.isLoadingEntities = false;
        }
      }
    )
  }

  navigateToDetail(id: number){
    this.router.navigate(['/app-smart-cloud/schedule/snapshot/detail/'+id])
  }

  onInputChange(value: string) {
    this.searchName = value;
    console.log('input text: ', this.searchName)
  }

  navigateToCreate() {
    this.router.navigate(['/app-smart-cloud/schedule/snapshot/create'])
  }


  regionChanged(region: RegionModel) {
    this.region = region.regionId
    this.searchSnapshotScheduleList();
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
    this.searchSnapshotScheduleList();
  }

}
