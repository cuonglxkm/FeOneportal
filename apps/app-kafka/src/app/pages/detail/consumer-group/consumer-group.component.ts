import { Component, Inject, Input, OnInit } from '@angular/core';
import { camelizeKeys } from 'humps';
import { NzTableSortFn, NzTableSortOrder } from 'ng-zorro-antd/table';
import { KafkaConsumerGroup, KafkaConsumerGroupDetail, KafkaConsumerGroupTopic } from '../../../core/models/kafka-consumer-group.model';
import { SyncInfoModel } from '../../../core/models/sync-info.model';
import { ConsumerGroupKafkaService } from '../../../services/consumer-group-kafka.service';
import { KafkaService } from '../../../services/kafka.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { LoadingService } from "@delon/abc/loading";
import { finalize } from 'rxjs';
import { AppConstants } from 'src/app/core/constants/app-constant';
import { TopicService } from 'src/app/services/kafka-topic.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from 'src/app/core/i18n/i18n.service';

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
  @Input() serviceOrderCode: string;

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

  heretext = 'tại đây';

  syncInfo: SyncInfoModel = new SyncInfoModel();
  isVisibleDelete = false;
  currentConsumerGroup: KafkaConsumerGroup;

  isAllowSync = true;

  constructor(
    private consumerGroupKafkaService: ConsumerGroupKafkaService,
    private kafkaService: KafkaService,
    private notification: NzNotificationService,
    private loadingSrv: LoadingService,
    private topicService: TopicService, 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) { }

  ngOnInit(): void {
    this.getListConsumerGroup(1, this.pageSize, '', this.serviceOrderCode);
    this.getSyncTime(this.serviceOrderCode);

    if (localStorage.getItem('locale') == AppConstants.LOCALE_EN) {
      this.changeLangData();
    }
  }

  changeLangData() {
    this.contentOfState = {
      active: 'The members of the group are operating steadily',
      empty: 'There are no members in the group',
      rebalancing: 'Members of the group are in a rebalancing state. Refer to additional causes in ',
      inActive: `The group has no members, and the group's metadata has been deleted.`
    }

    this.heretext = 'here';
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

  handleCancelDelete() {
    this.isVisibleDelete = false;
  }

  showDeleteConfirm(data: KafkaConsumerGroup) {
    this.isVisibleDelete = true;
    this.currentConsumerGroup = data;
  }

  handleOkDelete() {
    this.isVisibleDelete = false;
    this.loadingSrv.open({ type: "spin", text: "Loading..." });
    this.consumerGroupKafkaService.deleteConsumerGroup(this.currentConsumerGroup)
      .pipe(
        finalize(() => this.loadingSrv.close())
      )
      .subscribe(
        (data) => {
          if (data && data.code == 200) {
            this.notification.success(this.i18n.fanyi('app.status.success'), data.msg);
            this.getListConsumerGroup(this.pageIndex, this.pageSize, '', this.serviceOrderCode);
          } else {
            this.notification.error(this.i18n.fanyi('app.status.fail'), data.msg);
          }
        }
      );
  }

  getSyncTime(serviceOrderCode: string) {
    this.kafkaService.getSyncTime(serviceOrderCode)
      .subscribe((res) => {
        if (res.code && res.code == 200) {
          this.syncInfo = camelizeKeys(res.data) as SyncInfoModel;
        }
      });
  }

  handleSync() {
    this.isAllowSync = true;
    this.loadingSrv.open({ type: "spin", text: "Loading..." });
    this.consumerGroupKafkaService.sync(this.serviceOrderCode)
      .pipe(
        finalize(() => this.loadingSrv.close())
      )
      .subscribe((res) => {
        if (res && res.code == 200) {
          this.notification.success(this.i18n.fanyi('app.status.success'), res.msg);
            this.getListConsumerGroup(this.pageIndex, this.pageSize, '', this.serviceOrderCode);
            this.getSyncTime(this.serviceOrderCode);
        } else {
          this.notification.error(this.i18n.fanyi('app.status.fail'), res.msg);
        }
      })
  }

  handleSyncTopicPartition() {
    this.loadingSrv.open({ type: "spin", text: "Loading..." });
    this.topicService.syncTopicPartition(this.serviceOrderCode)
      .pipe(
        finalize(() => this.loadingSrv.close())
      )
      .subscribe((res) => {
        if (res && res.code == 200) {
          this.notification.success(this.i18n.fanyi('app.status.success'), res.msg);
            this.getListTopicInGroup(this.currentGroupId, this.serviceOrderCode, this.searchTopicText.trim());
            this.getSyncTime(this.serviceOrderCode);
        } else {
          this.notification.error(this.i18n.fanyi('app.status.fail'), res.msg);
        }
      })
  }
}
