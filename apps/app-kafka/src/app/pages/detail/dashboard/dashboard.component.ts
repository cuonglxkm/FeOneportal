import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexStroke,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  ChartComponent
} from 'ng-apexcharts';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { Subject, takeUntil } from 'rxjs';
import { ChartData } from '../../../models/chart-data.model';
import { HealthCheckModel } from '../../../models/health-check.model';
import { DashBoardService } from '../../../services/dashboard.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  fill: ApexFill;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  colors: string[];
  legend: ApexLegend;
  tooltip: ApexTooltip;
};

@Component({
  selector: 'one-portal-kafka-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  @ViewChild("chart") chart: ChartComponent;
  public chartHealthCheck: Partial<ChartOptions>;
  public chartMessage: Partial<ChartOptions>;
  public chartStorage: Partial<ChartOptions>;
  public chartProducers: Partial<ChartOptions>;
  public chartConsumers: Partial<ChartOptions>;

  // Tạo Subject để đánh dấu khi có lỗi
  private unsubscribe$ = new Subject<void>();

  serviceOrderCode = 'kafka-s1hnuicj7u7g';
  healthCheckData: HealthCheckModel = new HealthCheckModel();
  byteInData: ChartData = new ChartData();
  byteOutData: ChartData = new ChartData();
  messageRateData: ChartData = new ChartData();
  storageData: ChartData = new ChartData();

  previousTimeMins = 5;
  numPoints = 15;

  messageRateQuery = 'msg_rate';
  byteInQuery = 'byte_in';
  byteOutQuery = 'byte_out';
  storageQuery = 'storage';

  isHealth = 1;
  isHealthMsg = 'Test';
  clusterHealth = 1;
  clusterUnHealth = 0;
  clusterWarning = 2;

  listUnit = [
    {
      value: 'Byte',
      label: 'Byte'
    },
    {
      value: 'KB',
      label: 'KB'
    },
    {
      value: 'MB',
      label: 'MB'
    },
    {
      value: 'GB',
      label: 'GB'
    },
  ]
  unitStorage = 'MB';

  listRangeTime = [
    {
      value: 5,
      label: '5 phút trước'
    },
    {
      value: 15,
      label: '15 phút trước'
    },
    {
      value: 30,
      label: '30 phút trước'
    },
    {
      value: 60,
      label: '1 giờ trước'
    },
    {
      value: 240,
      label: '4 giờ trước'
    },
    {
      value: 480,
      label: '8 giờ trước'
    },
    {
      value: 720,
      label: '12 giờ trước'
    },
    {
      value: 1440,
      label: '24 giờ trước'
    }
  ]

  constructor(
    private dashBoardService: DashBoardService,
    @Inject(DOCUMENT) private doc: NzSafeAny
  ) { }

  ngOnInit(): void {
    this.getCheckHealthChart(this.serviceOrderCode, -1, -1);
    this.getByteInChart(this.serviceOrderCode, this.previousTimeMins, this.byteInQuery, this.numPoints);
    this.getByteOutChart(this.serviceOrderCode, this.previousTimeMins, this.byteOutQuery, this.numPoints);
    this.getMessageRateChart(this.serviceOrderCode, this.previousTimeMins, this.messageRateQuery, this.numPoints);
    this.getStorageChart(this.serviceOrderCode, this.previousTimeMins, this.storageQuery, this.numPoints, this.unitStorage);


  }

  onChangeUnitStorage() {
    this.getStorageChart(this.serviceOrderCode, this.previousTimeMins, this.storageQuery, this.numPoints, this.unitStorage);
  }

  onChangeTime() {
    this.getInfo4Chart();
  }

  getInfo4Chart() {
    if (this.previousTimeMins <= 5) {
      this.numPoints = 15;
    } else if (this.previousTimeMins > 5 && this.previousTimeMins <= 60) {
      this.numPoints = 30;
    } else if (this.previousTimeMins > 60 && this.previousTimeMins <= 240) {
      this.numPoints = 60;
    } else this.numPoints = 80;

    this.getMessageRateChart(this.serviceOrderCode, this.previousTimeMins, this.messageRateQuery, this.numPoints);
    this.getByteInChart(this.serviceOrderCode, this.previousTimeMins, this.byteInQuery, this.numPoints);
    this.getByteOutChart(this.serviceOrderCode, this.previousTimeMins, this.byteOutQuery, this.numPoints);
    this.getStorageChart(this.serviceOrderCode, this.previousTimeMins, this.storageQuery, this.numPoints, this.unitStorage);
  }

  getCheckHealthChart(serviceOrderCode: string, fromTime: number, toTime: number) {
    this.dashBoardService.getCheckHealthChart(serviceOrderCode, fromTime, toTime)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res: any) => {
        if (res.code && res.code == 200) {
          this.healthCheckData = res.data;
          if (this.healthCheckData) {
            this.setDataHealthCheckChart();
          }
        } else {
          this.unsubscribe$.next();
        }
      });
  }

  setDataHealthCheckChart() {
    const unCheckArr = this.healthCheckData.unCheck.map((e) => [e[0], null]);
    this.chartHealthCheck = {
      series: [
        {
          name: "Health",
          data: this.healthCheckData.health
        },
        {
          name: "UnHealth",
          data: this.healthCheckData.unHealth
        },
        {
          name: "Warning",
          data: this.healthCheckData.warning
        },
        // Trường hợp không lấy được data prometheus về DB portal
        {
          name: "",
          data: unCheckArr
        }
      ],
      chart: {
        height: 60,
        type: "scatter",
        zoom: {
          enabled: false
        },
        toolbar: {
          show: false
        }
      },
      colors: ['#2eb82e', '#cc0000', '#ff9800'],
      dataLabels: {
        enabled: false
      },
      grid: {
        xaxis: {
          lines: {
            show: true
          }
        },
        yaxis: {
          lines: {
            show: false
          }
        }
      },
      xaxis: {
        type: "datetime",
        labels: {
          datetimeUTC: false,
          format: "HH:mm"
        }
      },
      yaxis: {
        show: false
      },
      legend: {
        show: false
      },
      tooltip: {
        x: {
          format: 'dd/MM',
        },
        y: {
          formatter: function (val) {
            return ''
          },
          title: {
            formatter: function (seriesName) {
              return seriesName
            }
          }
        }
      }
    };
  }

  setDataChart(chartData: ChartData, seriesName: string, yaxisTitle: string): Partial<ChartOptions> {
    const chartOptions: Partial<ChartOptions> = {
      series: [
        {
          name: seriesName,
          data: chartData.value
        }
      ],
      chart: {
        height: 250,
        type: "area",
        zoom: {
          enabled: false
        },
        toolbar: {
          show: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          inverseColors: false,
          opacityFrom: 0.5,
          opacityTo: 0,
          stops: [0, 90, 100]
        },
      },
      grid: {
        xaxis: {
          lines: {
            show: false
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        },
      },
      xaxis: {
        type: "datetime",
        categories: chartData.time,
        axisBorder: {
          show: true,
          color: '#1a1a1a',
          offsetX: 1,
          offsetY: 0
        },
        labels: {
          datetimeUTC: false,
          format: "HH:mm:ss"
        }
      },
      yaxis: {
        show: true,
        title: {
          text: yaxisTitle,
          rotate: -90,
          offsetX: 0,
          offsetY: 0,
          style: {
            fontSize: '12px',
            fontWeight: 600,
          }
        },
        axisBorder: {
          show: true,
          color: '#1a1a1a',
          offsetX: 1,
          offsetY: 0
        },
      },
      tooltip: {
        x: {
          format: 'HH:mm:ss',
        },
      }
    };
    return chartOptions;
  }

  getByteInChart(serviceOrderCode: string, previousTimeMins: number, metricType: string, numPoints: number) {
    this.dashBoardService.getDataChart(serviceOrderCode, previousTimeMins, metricType, numPoints, '')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res: any) => {
        if (res.code && res.code == 200) {
          this.byteInData = res.data;
          if (this.byteInData) {
            this.chartProducers = this.setDataChart(this.byteInData, 'Byte', 'Base Byte In (B/s)',)
          }
        } else {
          this.unsubscribe$.next();
        }
      });
  }

  getByteOutChart(serviceOrderCode: string, previousTimeMins: number, metricType: string, numPoints: number) {
    this.dashBoardService.getDataChart(serviceOrderCode, previousTimeMins, metricType, numPoints, '')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res: any) => {
        if (res.code && res.code == 200) {
          this.byteOutData = res.data;
          if (this.byteOutData) {
            this.chartConsumers = this.setDataChart(this.byteOutData, 'Byte', 'Base Byte Out (B/s)');
          }
        } else {
          this.unsubscribe$.next();
        }
      });
  }

  getMessageRateChart(serviceOrderCode: string, previousTimeMins: number, metricType: string, numPoints: number) {
    this.dashBoardService.getDataChart(serviceOrderCode, previousTimeMins, metricType, numPoints, '')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res: any) => {
        if (res.code && res.code == 200) {
          this.messageRateData = res.data;
          if (this.messageRateData) {
            this.chartMessage = this.setDataChart(this.messageRateData, 'Message', 'Message rate/s');
          }
        } else {
          this.unsubscribe$.next();
        }
      });
  }

  getStorageChart(serviceOrderCode: string, previousTimeMins: number, metricType: string, numPoints: number, unit: string) {
    this.dashBoardService.getDataChart(serviceOrderCode, previousTimeMins, metricType, numPoints, unit)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res: any) => {
        if (res.code && res.code == 200) {
          this.storageData = res.data;
          if (this.storageData) {
            this.chartStorage = this.setDataChart(this.storageData, this.unitStorage, this.unitStorage)
          }
        } else {
          this.unsubscribe$.next();
        }
      });
  }

}
