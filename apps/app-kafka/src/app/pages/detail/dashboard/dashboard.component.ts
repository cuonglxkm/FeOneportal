import { DOCUMENT } from '@angular/common';
import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
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

import { ChartData } from '../../../core/models/chart-data.model';
import { DashboardGeneral } from '../../../core/models/dashboard-general.model';
import { HealthCheckModel } from '../../../core/models/health-check.model';
import { DashBoardService } from '../../../services/dashboard.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from 'src/app/core/i18n/i18n.service';
import { AppConstants } from 'src/app/core/constants/app-constant';

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
  public chartCpu: Partial<ChartOptions>;
  public chartRam: Partial<ChartOptions>;

  // Tạo Subject để đánh dấu khi có lỗi
  private unsubscribe$ = new Subject<void>();

  @Input() serviceOrderCode: string;
  healthCheckData: HealthCheckModel = new HealthCheckModel();
  byteInData: ChartData = new ChartData();
  byteOutData: ChartData = new ChartData();
  messageRateData: ChartData = new ChartData();
  storageData: ChartData = new ChartData();
  cpuData: ChartData = new ChartData();
  ramData: ChartData = new ChartData();

  statisticsNumber: DashboardGeneral = new DashboardGeneral();
  previousTimeMins = 5;
  numPoints = 15;

  messageRateQuery = 'msg';
  byteInQuery = 'byte_in';
  byteOutQuery = 'byte_out';
  storageQuery = 'msg';
  ramQuery = 'memory';
  cpuQuery= 'cpu';

  isHealth: number = null;
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
  ];

  resouceInstant = ['topic', 'offline_partition', 'message', 'partition']
  byteInChartTitle = 'Thông lượng dữ liệu truyền vào';
  byteOutChartTitle = 'Thông lượng dữ liệu truyền ra';
  messageRateChartTitle = 'Tổng số Message';
  storageChartTitle = 'Mức sử dụng Storage';
  ramChartTitle = 'Mức sử dụng RAM';
  cpuChartTitle = 'Mức sử dụng CPU';

  constructor(
    private dashBoardService: DashBoardService,
    @Inject(DOCUMENT) private doc: NzSafeAny,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) { }

  ngOnInit(): void {
    this.getStatisticNumber();
    this.checkClusterIsHealth(this.serviceOrderCode);
    this.getCheckHealthChart(this.serviceOrderCode, -1, -1);
    this.getByteInChart(this.serviceOrderCode, this.previousTimeMins, this.byteInQuery, this.numPoints);
    this.getByteOutChart(this.serviceOrderCode, this.previousTimeMins, this.byteOutQuery, this.numPoints);
    this.getMessageRateChart(this.serviceOrderCode, this.previousTimeMins, this.messageRateQuery, this.numPoints);
    this.getStorageChart(this.serviceOrderCode, this.previousTimeMins, this.storageQuery, this.numPoints, this.unitStorage);
    this.getCpuChart(this.serviceOrderCode, this.previousTimeMins, this.cpuQuery, this.numPoints);
    this.getRamChart(this.serviceOrderCode, this.previousTimeMins, this.ramQuery, this.numPoints);
    
    if (localStorage.getItem('locale') == AppConstants.LOCALE_EN) {
      this.changeLangData();
    }
    
  }

  changeLangData() {
      this.byteInChartTitle = 'Incoming Data Throughput';
      this.byteOutChartTitle = 'Outgoing Data Throughput';
      this.messageRateChartTitle = 'Total Messages';
      this.storageChartTitle = 'Storage Usage';
      this.ramChartTitle = 'RAM Usage';
      this.cpuChartTitle = 'CPU Usage';

      this.listRangeTime = [
        {
          value: 5,
          label: '5 minutes ago'
        },
        {
          value: 15,
          label: '15 minutes ago'
        },
        {
          value: 30,
          label: '30 minutes ago'
        },
        {
          value: 60,
          label: '1 hour ago'
        },
        {
          value: 240,
          label: '4 hours ago'
        },
        {
          value: 480,
          label: '8 hours ago'
        },
        {
          value: 720,
          label: '12 hours ago'
        },
        {
          value: 1440,
          label: '24 hours ago'
        }
      ];
  }

  getStatisticNumber() {
    for (let i = 0; i < this.resouceInstant.length; i++) {
      this.getDataInstant(this.resouceInstant[i], this.serviceOrderCode);
    }
  }

  getDataInstant(resource: string, serviceOrderCode: string) {
    this.dashBoardService.getDataInstant(resource, serviceOrderCode)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (res) => {
          if (res.code && res.code == 200) {
            this.statisticsNumber[resource] = res.data;
          } else {
            this.unsubscribe$.next();
          }
        });
  }

  checkClusterIsHealth(serviceOrderCode: string) {
    this.dashBoardService.getCheckHealthCluster(serviceOrderCode)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        if (res.code && res.code == 200) {
          this.isHealth = res.data.status;
          this.isHealthMsg = res.data.message;
        } else {
          this.unsubscribe$.next();
        }
      });
  }

  getOffParColor(): string {
    return this.statisticsNumber.offline_partition > 0 ? '#ff0000' : '#308ef3';
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
    this.getCpuChart(this.serviceOrderCode, this.previousTimeMins, this.cpuQuery, this.numPoints);
    this.getRamChart(this.serviceOrderCode, this.previousTimeMins, this.ramQuery, this.numPoints);
  }

  getCheckHealthChart(serviceOrderCode: string, fromTime: number, toTime: number) {
    this.dashBoardService.getCheckHealthChart(serviceOrderCode, fromTime, toTime)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
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
      colors: ['#06BC62', '#F74132'],
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

  setDataChart(chartData: ChartData, seriesName: string, yaxisTitle: string, chartTitle: string): Partial<ChartOptions> {
    const chartOptions: Partial<ChartOptions> = {
      series: [
        {
          name: seriesName,
          data: chartData.value
        }
      ],
      chart: {
        height: 360,
        type: "line",
        zoom: {
          enabled: true,
          type: 'x',  
          autoScaleYaxis: false,  
          zoomedArea: {
            fill: {
              color: '#90CAF9',
              opacity: 0.4
            },
            stroke: {
              color: '#0D47A1',
              opacity: 0.4,
              width: 1
            }
          }
        },
        toolbar: {
          show: true, 
          offsetX: 0,
          offsetY: 0,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
            customIcons: []
          },
          export: {
            csv: {
              filename: undefined,
              columnDelimiter: ',',
              headerCategory: 'category',
              headerValue: 'value',
              dateFormatter(timestamp) {
                return new Date(timestamp).toDateString()
              }
            },
            svg: {
              filename: undefined,
            },
            png: {
              filename: undefined,
            }
          },
          autoSelected: 'zoom' 
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "straight",
        width: 3,
      },
      fill: {
        // type: 'gradient',
        // gradient: {
        //   shadeIntensity: 1,
        //   inverseColors: false,
        //   opacityFrom: 0.5,
        //   opacityTo: 0,
        //   // stops: [0, 90, 100]
        // },
      },
      title: {
        text: chartTitle + ' (' + yaxisTitle + ')',
        align: "left",
        style: {
          fontSize: "16px",
          fontFamily: "Inter",
          fontWeight: 600,
          color: "#333333"
        }
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
        // axisBorder: {
        //   show: true,
        //   color: '#1a1a1a',
        //   offsetX: 1,
        //   offsetY: 0
        // },
        labels: {
          datetimeUTC: false,
          showDuplicates: false,
          format: "HH:mm"
        }
      },
      yaxis: {
        show: true,
        // title: {
        //   text: yaxisTitle,
        //   offsetX: 25,
        //   offsetY: -150,
        //   rotate: 0,
        //   style: {
        //     fontSize: "12px",
        //     fontFamily: "Inter",
        //     fontWeight: 600,
        //     color: "#333333"
        //   }
        // },
        // axisBorder: {
        //   show: true,
        //   color: '#1a1a1a',
        //   offsetX: 1,
        //   offsetY: 0
        // },
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
      .subscribe((res) => {
        if (res.code && res.code == 200) {
          this.byteInData = res.data;
          if (this.byteInData) {
            this.chartProducers = this.setDataChart(this.byteInData, this.byteInData.unit, this.byteInData.unit, this.byteInChartTitle);
          }
        } else {
          this.unsubscribe$.next();
        }
      });
  }

  getByteOutChart(serviceOrderCode: string, previousTimeMins: number, metricType: string, numPoints: number) {
    this.dashBoardService.getDataChart(serviceOrderCode, previousTimeMins, metricType, numPoints, '')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        if (res.code && res.code == 200) {
          this.byteOutData = res.data;
          if (this.byteOutData) {
            this.chartConsumers = this.setDataChart(this.byteOutData, this.byteOutData.unit, this.byteOutData.unit, this.byteOutChartTitle);
          }
        } else {
          this.unsubscribe$.next();
        }
      });
  }

  getMessageRateChart(serviceOrderCode: string, previousTimeMins: number, metricType: string, numPoints: number) {
    this.dashBoardService.getDataChart(serviceOrderCode, previousTimeMins, metricType, numPoints, '')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        if (res.code && res.code == 200) {
          this.messageRateData = res.data;
          if (this.messageRateData) {
            this.chartMessage = this.setDataChart(this.messageRateData, this.messageRateData.unit, this.messageRateData.unit, this.messageRateChartTitle);
          }
        } else {
          this.unsubscribe$.next();
        }
      });
  }

  getStorageChart(serviceOrderCode: string, previousTimeMins: number, metricType: string, numPoints: number, unit: string) {
    this.dashBoardService.getDataChart(serviceOrderCode, previousTimeMins, metricType, numPoints, unit)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        if (res.code && res.code == 200) {
          this.storageData = res.data;
          if (this.storageData) {
            this.chartStorage = this.setDataChart(this.storageData, this.unitStorage, this.unitStorage, this.storageChartTitle)
          }
        } else {
          this.unsubscribe$.next();
        }
      });
  }

  getCpuChart(serviceOrderCode: string, previousTimeMins: number, metricType: string, numPoints: number) {
    this.dashBoardService.getDataChart(serviceOrderCode, previousTimeMins, metricType, numPoints, '')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        if (res.code && res.code == 200) {
          this.cpuData = res.data;
          if (this.cpuData) {
            this.chartCpu = this.setDataChart(this.cpuData, '%', '%', this.cpuChartTitle)
          }
        } else {
          this.unsubscribe$.next();
        }
      });
  }

  getRamChart(serviceOrderCode: string, previousTimeMins: number, metricType: string, numPoints: number) {
    this.dashBoardService.getDataChart(serviceOrderCode, previousTimeMins, metricType, numPoints, '')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        if (res.code && res.code == 200) {
          this.ramData = res.data;
          if (this.ramData) {
            this.chartRam = this.setDataChart(this.ramData, '%', '%', this.ramChartTitle)
          }
        } else {
          this.unsubscribe$.next();
        }
      });
  }

}
