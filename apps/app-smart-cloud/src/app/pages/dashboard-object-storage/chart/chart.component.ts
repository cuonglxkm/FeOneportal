import { AfterViewInit, Component } from '@angular/core';
import { Line } from '@antv/g2plot';
@Component({
  selector: 'one-portal-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.less']
})
export class ChartComponent implements AfterViewInit {
  createChart1() {
    const data = [
      { year: '1991', value: 3 },
      { year: '1992', value: 4 },
      { year: '1993', value: 3.5 },
      { year: '1994', value: 5 },
      { year: '1995', value: 4.9 },
      { year: '1996', value: 6 },
      { year: '1997', value: 7 },
      { year: '1998', value: 9 },
      { year: '1999', value: 13 }
    ];
    const line = new Line('container', {
      data,
      xField: 'year',
      yField: 'value',
    });

    line.render();
  }

  createChart2() {
    const data = [
      { year: '1991', value: 3 },
      { year: '1992', value: 4 },
      { year: '1993', value: 3.5 },
      { year: '1994', value: 5 },
      { year: '1995', value: 4.9 },
      { year: '1996', value: 6 },
      { year: '1997', value: 7 },
      { year: '1998', value: 9 },
      { year: '1999', value: 13 }
    ];

    const line = new Line('chart2', {
      data,
      xField: 'year',
      yField: 'value',
    });

    line.render();
  }

  ngAfterViewInit(): void {
    this.createChart1()
    this.createChart2()
  }


}
