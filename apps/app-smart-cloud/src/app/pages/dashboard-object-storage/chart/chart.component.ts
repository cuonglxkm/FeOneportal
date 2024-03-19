import { AfterViewInit, Component, ElementRef, Input } from '@angular/core';
import { Line } from '@antv/g2plot';
import { Summary } from '../../../shared/models/object-storage.model';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'one-portal-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.less']
})
export class ChartComponent implements AfterViewInit {
  @Input() summary: Summary[];
  newDate: Date = new Date();

  constructor(private elementRef: ElementRef,) {
  }

  createChartStorageUse() {
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

    const line = new Line('storage-use', {
      data,
      xField: 'year',
      yField: 'value'
    });

    line.render();
  }

  createNumberObject() {
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
    const line = new Line('number-object', {
      data,
      xField: 'year',
      yField: 'value'
    });

    line.render();
  }

  createStorageUpload() {
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
    const line = new Line('storage-upload', {
      data,
      xField: 'year',
      yField: 'value'
    });

    line.render();
  }

  createStorageDownload() {
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
    const line = new Line('storage-download', {
      data,
      xField: 'year',
      yField: 'value'
    });

    line.render();
  }

  downloadImagePng(type): void {
    const imgUrl = 'assets/imgs/' + type + '.png'; // Thay đổi đường dẫn tới hình ảnh của bạn
    const link = document.createElement('a');
    link.href = imgUrl;
    link.download = type + '.png'; // Tên tệp tải xuống
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  downloadImageJpg(type): void {
    const imgUrl = 'assets/imgs/' + type + '.jpg'; // Thay đổi đường dẫn tới hình ảnh của bạn
    const link = document.createElement('a');
    link.href = imgUrl;
    link.download = type + '.jpg'; // Tên tệp tải xuống
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  downloadPDF(type): void {
    const pdfUrl = 'assets/imgs/' + type + '.pdf'; // Thay đổi đường dẫn tới tài liệu PDF của bạn
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = type + '.pdf'; // Tên tệp tải xuống
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  downloadSVG(type): void {
    const svgUrl = 'assets/imgs/' + type + '.svg'; // Thay đổi đường dẫn tới hình ảnh SVG của bạn
    const link = document.createElement('a');
    link.href = svgUrl;
    link.download = type + '.svg'; // Tên tệp tải xuống
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  toggleFullScreen(cellNumber: number): void {
      // Implement code to open full screen view for the selected cell
      console.log(`Open full screen for cell ${cellNumber}`);
    const elem = this.elementRef.nativeElement;

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
      elem.msRequestFullscreen();
    }

  }

  ngAfterViewInit(): void {
    this.createChartStorageUse();
    this.createNumberObject();
    this.createStorageUpload();
    this.createStorageDownload();
  }
}
