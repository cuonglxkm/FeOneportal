import { Component, Input, OnInit } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexLegend,
  ApexStroke,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis
} from "ng-apexcharts";
import { MonitoringService } from '../../../services/monitoring.service';
import { SharedService } from '../../../services/shared.service';
import { debounceTime } from 'rxjs';
import { FilterOptionModel, MonitoringData } from '../../../core/models/monitoring-data.model';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  colors: string[];
  legend: ApexLegend;
  tooltip: ApexTooltip;
};

@Component({
  selector: 'one-portal-monitoring-service',
  templateUrl: './monitoring-service.component.html',
  styleUrls: ['./monitoring-service.component.css'],
})
export class MonitoringServiceComponent implements OnInit {
  @Input() serviceOrderCode: string;

  listRangeTime = [
    { label: "30s/lần", value: 30 },
    { label: "1 phút/lần", value: 60 },
    { label: "5 phút/lần", value: 300 },
    { label: "30 phút/lần", value: 1800 }
  ];
  listOfMetricsTopic = [
    { label: "Size", value: "size" },
    { label: "Bytes In", value: "byte_in" },
    { label: "Bytes Out", value: "byte_out" },
    { label: "Message In", value: "msg_in" },
    { label: "Tổng số message", value: "total_msg" },
    { label: "Phân bổ message trên partition", value: "msg_per_partition" }
  ];

  listOfMetricsConsumerGroup = [
    { label: "Message Consumer", value: "msg_cg" },
    { label: "Lag của Consumer Group", value: "lag_cg" },
  ];

  listOfResourceData: any[];
  listOfResourceTmp: any[];

  resourceType: string;
  intervalSelected: number;
  labelSelectList: string;
  setOfResources = new Set<string>();
  listOfLabelResource: string[];
  displayLabelResource: string;
  resourceKeyword: string;
  currentMetrics: string;

  setOfMetrics = new Set<string>();
  listOfLabelMetrics: string[];
  displayLabelMetrics: string;

  pageIndex = 1;
  pageSize = 1000;
  lenResource: number;

  listOfResourceChartData: Partial<ChartOptions>[];
  interval: any;
  resourceTopic = 'topic';
  resourceConsumerGroup = 'cg';

  constructor(
    private monitoringService: MonitoringService,
    private sharedService: SharedService
  ) {
    this.listOfResourceChartData = [];
  }

  ngOnInit(): void {
    this.sharedService.filterOption.pipe(
      debounceTime(500)
    )
      .subscribe((item: FilterOptionModel) => {
        this.listOfResourceChartData = [];
        if (this.interval) {
          clearInterval(this.interval);
        }

        const resource = item.resources?.join(',');
        const interval = item.interval / 1000;
        this.resourceType = item.resourceType;

        for (const metric of item.metrics) {
          this.getMonitoringData(resource, metric, interval, item.resourceType, this.serviceOrderCode);
        }

        this.interval = setInterval(() => {
          this.listOfResourceChartData = [];
          for (const metric of item.metrics) {
            this.getMonitoringData(resource, metric, interval, item.resourceType, this.serviceOrderCode);
          }
        }, item.interval)
      });
  }

  getMonitoringData(
    resources: string,
    metric: string,
    interval: number,
    resource: string,
    serviceOrderCode: string
  ) {
    this.monitoringService.getMonitoringTopicData(
      serviceOrderCode,
      metric, interval,
      resource, resources
    ).subscribe((r) => {
      const resourceChartData = r.data;
      if (resourceChartData) {
        this.currentMetrics = metric;
        const chartOption = this.setTopicsChartData(resourceChartData);
        this.listOfResourceChartData.push(chartOption);
      }
    });
  }

  setTopicsChartData(resourceChartData: MonitoringData): Partial<ChartOptions> {
    if (resourceChartData) {
      let chartOption: Partial<ChartOptions> = null;
      chartOption = {
        chart: {
          height: 360,
          type: "line",
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
          curve: "straight",
          width: 2,
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
        tooltip: {
          x: {
            format: 'HH:mm:ss dd/MM/yyyy',
          },
        }
      };

      // init data chart
      chartOption.series = [];
      chartOption.xaxis = {} as ApexXAxis;
      chartOption.title = {} as ApexTitleSubtitle;
      chartOption.xaxis.labels = {};

      let titleChart = [];
      if (this.resourceType == this.resourceTopic) {
        titleChart = this.listOfMetricsTopic.filter(item =>
          item.value == this.currentMetrics);
      } else if (this.resourceType == this.resourceConsumerGroup) {
        titleChart = this.listOfMetricsConsumerGroup.filter(item =>
          item.value == this.currentMetrics);
      }


      chartOption.title = {
        text: titleChart[0]?.label,
        align: 'center',
        style: {
          fontSize: "16px",
          fontFamily: "Inter",
          fontWeight: 600,
          color: "#333333"
        }
      };

      const valueChart = resourceChartData.results;
      const data = new Map(Object.entries(valueChart));
      for (const [k, v] of data) {
        const val: any = v;
        chartOption.series.push({
          name: k,
          data: val
        });
      }

      chartOption.xaxis = {
        type: "datetime",
        categories: resourceChartData.time,
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
      };

      chartOption.yaxis = {
        show: true,
        title: {
          text: resourceChartData.unit,
          rotate: -90,
          offsetX: 0,
          offsetY: 0,
          style: {
            fontSize: "14px",
            fontFamily: "Inter",
            fontWeight: 600,
            color: "#333333"
          }
        },
        axisBorder: {
          show: true,
          color: '#1a1a1a',
          offsetX: 1,
          offsetY: 0
        },
      };

      // this.topicsChart = chartOption;
      return chartOption;
    } else return null;
  }

}
