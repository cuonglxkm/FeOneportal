import { Component, ViewChild } from '@angular/core';

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
export class OverviewComponent {
  // selectedIndex : 0 | any;
  // status_step: number | any ;
 
  // @ViewChild("chart") chart: ChartComponent | any;
  // public chartOptions: Partial<ChartOptions>;

  // constructor() {
  //   this.chartOptions = {
  //     series: [
  //       {
  //         name: "STOCK ABC",
  //         data: series.monthDataSeries1.prices
  //       }
  //     ],
  //     chart: {
  //       type: "area",
  //       height: 350,
  //       zoom: {
  //         enabled: false
  //       }
  //     },
  //     dataLabels: {
  //       enabled: false
  //     },
  //     stroke: {
  //       curve: "straight"
  //     },

  //     title: {
  //       text: "Fundamental Analysis of Stocks",
  //       align: "left"
  //     },
  //     subtitle: {
  //       text: "Price Movements",
  //       align: "left"
  //     },
  //     labels: series.monthDataSeries1.dates,
  //     xaxis: {
  //       type: "datetime"
  //     },
  //     yaxis: {
  //       opposite: true
  //     },
  //     legend: {
  //       horizontalAlign: "right"
  //     }
  //   };
  // }
}
