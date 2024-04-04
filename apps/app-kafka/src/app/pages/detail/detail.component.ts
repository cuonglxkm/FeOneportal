import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KafkaDetail } from 'src/app/core/models/kafka-infor.model';
import { KafkaService } from 'src/app/services/kafka.service';

@Component({
  selector: 'one-portal-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css'],
})
export class DetailComponent implements OnInit {
  selectedIndex = 0;
  serviceOrderCode: string;
  itemDetail: KafkaDetail;
  regionId = 3;
  projectId = 1;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private kafkaService: KafkaService
  ) { }

  ngOnInit(): void {
    this._activatedRoute.queryParams
      .subscribe(
        params => {
          if (params['tab']) {
            this.selectedIndex = params['tab'];
          }
        }
      );
    this.selectedIndex = +localStorage.getItem('selectedTabIndex') || 0;

    this._activatedRoute.params.subscribe((params) => {
      this.serviceOrderCode = params.id;
      this.getDetail();
    });
  }

  setTransactionTabIndex(e: number) {
    this.selectedIndex = e;
    localStorage.setItem('selectedTabIndex', e.toString());
  }

  getDetail() {
    this.kafkaService.getDetail(this.serviceOrderCode)
    .subscribe(
      res => {
        if (res && res.code == 200) {
          this.itemDetail = res.data;
        }
      }
    )
  }


}
