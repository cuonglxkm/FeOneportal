import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { camelizeKeys } from 'humps';
import { KafkaDetail } from 'src/app/core/models/kafka-infor.model';
import { KafkaService } from 'src/app/services/kafka.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from 'src/app/core/i18n/i18n.service';

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
    private kafkaService: KafkaService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
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

    localStorage.setItem('locale', this.i18n.defaultLang);
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
          this.itemDetail = camelizeKeys(res.data) as KafkaDetail;
        }
      }
    )
  }


}
