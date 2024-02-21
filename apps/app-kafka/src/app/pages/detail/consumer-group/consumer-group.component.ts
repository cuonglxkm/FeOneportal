import { Component, OnInit } from '@angular/core';
import { camelizeKeys } from 'humps';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableSortFn, NzTableSortOrder } from 'ng-zorro-antd/table';
import { KafkaConsumerGroup, KafkaConsumerGroupDetail, KafkaConsumerGroupTopic } from '../../../core/models/kafka-consumer-group.model';
import { SyncInfoModel } from '../../../core/models/sync-info.model';
import { ConsumerGroupKafkaService } from '../../../services/consumer-group-kafka.service';
import { KafkaService } from '../../../services/kafka.service';

interface DataItem {
  partitionName: number,
  consumerId: string,
  hostInfo: string,
  lag: number,
  currentOffset: number,
  endOffset: number
}

interface ColumnItem {
  name: string;
  width: string;
  sortOrder: NzTableSortOrder | null;
  sortFn: NzTableSortFn | null;
  sortDirections: NzTableSortOrder[];
}

@Component({
  selector: 'one-portal-consumer-group',
  templateUrl: './consumer-group.component.html',
  styleUrls: ['./consumer-group.component.css'],
})


export class ConsumerGroupComponent implements OnInit { 
  serviceOrderCode: string;

  listConsumerGroup: KafkaConsumerGroup[];

  listTopicOfCG: KafkaConsumerGroupTopic[];

  listOfColumnTopic: ColumnItem[] = [
    {
      name: 'Partition',
      width: '10%',
      sortOrder: 'null',
      sortFn: (a: DataItem, b: DataItem) => b.partitionName - a.partitionName,
      sortDirections: ['ascend', 'descend', null]
    },
    {
      name: 'Consumer ID',
      width: '40%',
      sortOrder: 'null',
      sortFn: (a: DataItem, b: DataItem) => b.consumerId.localeCompare(a.consumerId),
      sortDirections: ['ascend', 'descend', null]
    },
    {
      name: 'Host',
      width: '15%',
      sortOrder: 'null',
      sortFn: (a: DataItem, b: DataItem) => b.hostInfo.localeCompare(a.hostInfo),
      sortDirections: ['ascend', 'descend', null]
    },
    {
      name: 'Overall lag',
      width: '15%',
      sortOrder: 'null',
      sortFn: (a: DataItem, b: DataItem) => b.lag - a.lag,
      sortDirections: ['ascend', 'descend', null]
    },
    {
      name: 'Current Offset',
      width: '10%',
      sortOrder: 'null',
      sortFn: (a: DataItem, b: DataItem) => b.currentOffset - a.currentOffset,
      sortDirections: ['ascend', 'descend', null]
    },
    {
      name: 'End Offset',
      width: '10%',
      sortOrder: 'null',
      sortFn: (a: DataItem, b: DataItem) => b.endOffset - a.endOffset,
      sortDirections: ['ascend', 'descend', null]
    }
  ];

  detailConsumerGroup: KafkaConsumerGroupDetail;

  total = 1;
  pageSize = 10;
  pageIndex = 1;
  loadingTbl = true;
  searchText = '';
  searchTopicText = '';
  currentGroupId = 'Detail';

  //0 List,1 create,2 update
  idListForm = 0;
  idDetailForm = 1;
  showForm: number = this.idListForm;

  expandSet = new Set<number>();

  stateActive = 'STABLE';
  stateEmpty = 'EMPTY';
  statePreRebalancing = 'PREPARING_REBALANCE';
  stateCompleteRebalancing = 'COMPLETING_REBALANCE';
  stateInactive = 'DEAD';

  contentOfState = {
    active: 'Các thành viên của group đang hoạt động ổn định.',
    empty: 'Không có thành viên nào trong group.',
    rebalancing: 'Thành viên của group đang ở trạng thái tái cân bằng. Tham khảo thêm nguyên nhân ',
    inActive: 'Không có thành viên nào trong group và metadata của group đã bị xoá.'
  };

  syncInfo: SyncInfoModel = new SyncInfoModel();

  constructor(
    private consumerGroupKafkaService: ConsumerGroupKafkaService,
    private modal: NzModalService,
    private kafkaService: KafkaService,
  ) { }

  ngOnInit(): void {
    this.serviceOrderCode = 'kafka-s1hnuicj7u7g';
    this.getListConsumerGroup(1, this.pageSize, '', this.serviceOrderCode);
    this.getSyncTime(this.serviceOrderCode);
  }

  getListConsumerGroup(pageIndex: number, pageSize: number, keySearch: string, serviceOrderCode: string) {
    this.loadingTbl = true;
    this.consumerGroupKafkaService.getListConsumerGroup(pageIndex, pageSize, keySearch.trim(), serviceOrderCode)
      .subscribe((res) => {
        if (res.code && res.code == 200) {
          this.loadingTbl = false;
          this.total = res.data.totals;
          this.listConsumerGroup = camelizeKeys(res.data.results) as KafkaConsumerGroup[];
        }
      });
  }


  onSearch() {
    this.getListConsumerGroup(this.pageIndex, this.pageSize, this.searchText, this.serviceOrderCode);
  }

  changePage(event: number) {
    this.pageIndex = event;
    this.getListConsumerGroup(this.pageIndex, this.pageSize, this.searchText, this.serviceOrderCode);
  }

  changeSize(event: number) {
    this.pageSize = event;
    this.getListConsumerGroup(this.pageIndex, this.pageSize, this.searchText, this.serviceOrderCode);
  }

  viewDetail(event: string) {
    this.currentGroupId = event;
    this.getDetailConsumerGroup(event, this.serviceOrderCode);
    this.getListTopicInGroup(event, this.serviceOrderCode, this.searchTopicText);
    this.showForm = this.idDetailForm;
  }

  getDetailConsumerGroup(groupId: string, serviceOrderCode: string) {
    this.consumerGroupKafkaService.getDetailConsumerGroup(groupId, serviceOrderCode)
      .subscribe((res) => {
        if (res.code && res.code == 200) {
          this.detailConsumerGroup = camelizeKeys(res.data) as KafkaConsumerGroupDetail;
        }
      });
  }

  getListTopicInGroup(groupId: string, serviceOrderCode: string, keySearch: string) {
    this.consumerGroupKafkaService.getListTopicInGroup(groupId, serviceOrderCode, keySearch)
      .subscribe((res) => {
        if (res.code && res.code == 200) {
          this.listTopicOfCG = camelizeKeys(res.data) as KafkaConsumerGroupTopic[];
        }
      });
  }

  backList() {
    this.showForm = this.idListForm;
  }

  onSearchTopic() {
    this.getListTopicInGroup(this.currentGroupId, this.serviceOrderCode, this.searchTopicText.trim());
  }

  onExpandChange(id: number, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
  }

  showDeleteConfirm(data: KafkaConsumerGroup) {
    this.modal.confirm({
      nzTitle: 'Bạn có chắc chắn muốn xóa Consumer Group không?',
      nzOkText: 'Đồng ý',
      nzOkType: 'primary',
      nzOkDanger: false,
      nzOnOk: () => {
        this.consumerGroupKafkaService.deleteConsumerGroup(data).pipe()
          .subscribe(
            (data) => {
              if (data && data.code == 200) {
                this.getListConsumerGroup(this.pageIndex, this.pageSize, '', this.serviceOrderCode);
              }
            }
          );
      },
      nzCancelText: 'Hủy bỏ',
      nzOnCancel: () => console.log('Cancel')
    });
  }

  getSyncTime(serviceOrderCode: string) {
    this.kafkaService.getSyncTime(serviceOrderCode)
    .subscribe((res:any) => {
      if (res.code && res.code == 200) {
        this.syncInfo = res.data;
      }
    });
  }
}
