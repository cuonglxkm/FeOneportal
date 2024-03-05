import { Component, OnInit } from '@angular/core';
import { camelizeKeys } from 'humps';
import { NzModalService } from 'ng-zorro-antd/modal';
import { KafkaInfor } from 'src/app/core/models/kafka-infor.model';
import { KafkaService } from 'src/app/services/kafka.service';

@Component({
  selector: 'one-portal-list-kafka',
  templateUrl: './list-kafka.component.html',
  styleUrls: ['./list-kafka.component.css'],
})
export class KafkaDetailComponent implements OnInit {
  listOfKafka: KafkaInfor[] = [];
  keySearch: string;
  serviceStatus: number;
  pageIndex: number;
  pageSize: number;
  total: number;

  setOfCheckedId = new Set<number>();

  constructor(
    private kafkaService: KafkaService,
    // private modalService: NzModalService
  ) {
    this.keySearch = '';
    this.serviceStatus = null;
    this.pageIndex = 1;
    this.pageSize = 10;
    this.total = 1;
  }

  // temp
  listOfStatusKafka: Array<{ label: string; value: number }> = [
    { label: "Chưa gia hạn", value: 0 },
    { label: "Đang khởi tạo", value: 1 },
    { label: "Đang hoạt động", value: 2 },
    { label: "Đang xóa", value: 7 },
  ]


  ngOnInit(): void {
    this.getListService(this.pageSize, this.pageIndex, this.keySearch, this.serviceStatus);
  }

  getListService(size: number, index: number, keySearch: string, status: number) {
    this.kafkaService.getListService(index, size, keySearch, status)
      .subscribe((data) => {
        console.log(data);
        this.total = data?.data?.totals;
        this.pageSize = data?.data?.size;
        this.listOfKafka = camelizeKeys(data?.data?.results) as KafkaInfor[];
      });

  }

  handleChange() {
    this.getListService(this.pageSize, this.pageIndex, this.keySearch, this.serviceStatus)
  }

  handleSyncKafka() { }
  onQueryParamsChange(event) { }
  onAllClusterChecked(event) { }
}
