import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'one-portal-static-web-hosting',
  templateUrl: './static-web-hosting.component.html',
  styleUrls: ['./static-web-hosting.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaticWebHostingComponent implements OnInit {
  inputFile: string;
  inputErrorFile: string;
  inputURL: string;
  isNavigate: boolean = false;

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  staticOn: boolean = true;
  staticOff: boolean = false;
  initStaticOn(): void {
    this.staticOn = true;
    this.staticOff = false;
  }
  initStaticOff(): void {
    this.staticOn = false;
    this.staticOff = true;
  }
}
