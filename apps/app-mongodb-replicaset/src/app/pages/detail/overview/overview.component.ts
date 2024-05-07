import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexLegend
} from "ng-apexcharts";

import { series } from './data';
import { MongoService } from '../../../service/mongo.service';
import { ShareService } from '../../../service/share.service';
import { Subject, takeUntil } from 'rxjs';
import { MongodbDetail } from '../../../model/mongodb-detail.model';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  labels: string[];
  legend: ApexLegend;
  subtitle: ApexTitleSubtitle;
};

@Component({
  selector: 'one-portal-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css'],
})
export class OverviewComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject();

  @Input() serviceCode: string;
  // selectedIndex : 0 | any;
  status_step: number | any;
  @ViewChild("chart") chart: ChartComponent | any;

  mongoDetail: MongodbDetail;
  public chartOptions: Partial<ChartOptions>;

  constructor(
    private mongoService: MongoService,
    private shareService: ShareService
  ) {
    this.chartOptions = {
      series: [
        {
          name: "STOCK ABC",
          data: series.monthDataSeries1.prices
        }
      ],
      chart: {
        type: "line",
        height: 360,
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "straight"
      },

      title: {
        text: "Biểu đồ connection",
        align: "left",
        style: {
          fontSize: "16px",
          fontFamily: "Inter",
          fontWeight: 600,
          color: "#1362B9"
        }
      },
      subtitle: {
        text: "",
        align: "left"
      },
      labels: series.monthDataSeries1.dates,
      xaxis: {
        type: "datetime",
        labels: {
          datetimeUTC: false,
          showDuplicates: false,
          format: "dd/MM"
        }
      },
      yaxis: {
        show: true
      },
      legend: {
        horizontalAlign: "right"
      }
    };
  }

  ngOnInit(): void {

    // listen event refresh page
    this.shareService.overviewObs
    .pipe(takeUntil(this.destroy$))
    .subscribe(r => {
      this.getDetail();
    })

    this.getDetail();
    
  }

  ngOnDestroy(): void {
      this.destroy$.next(null);
      this.destroy$.complete();
  }

  getDetail() {
    this.mongoService.getDetail(this.serviceCode).subscribe(result => {
      this.mongoDetail = result.data
      console.log(result.data);

    });
  }
}
