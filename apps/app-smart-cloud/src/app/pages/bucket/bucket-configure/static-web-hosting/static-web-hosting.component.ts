import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { BucketService } from 'src/app/shared/services/bucket.service';

@Component({
  selector: 'one-portal-static-web-hosting',
  templateUrl: './static-web-hosting.component.html',
  styleUrls: ['./static-web-hosting.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaticWebHostingComponent implements OnInit {
  @Input() bucketName: string;
  inputFile: string;
  inputErrorFile: string;
  inputURL: string;
  isNavigate: boolean = false;

  constructor(private bucketService: BucketService) {}

  ngOnInit(): void {
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
