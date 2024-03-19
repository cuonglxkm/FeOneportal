import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'one-portal-bucket-configure',
  templateUrl: './bucket-configure.component.html',
  styleUrls: ['../bucket-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BucketConfigureComponent implements OnInit {
  bucketName: string;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.bucketName = this.activatedRoute.snapshot.paramMap.get('bucketName');
  }

  activePrivate: boolean = true;
  activePublic: boolean = false;
  initPrivate(): void {
    this.activePrivate = true;
    this.activePublic = false;
  }
  initPublic(): void {
    this.activePrivate = false;
    this.activePublic = true;
  }

  versionOn: boolean = true;
  versionOff: boolean = false;
  initVersionOn(): void {
    this.versionOn = true;
    this.versionOff = false;
  }
  initVersionOff(): void {
    this.versionOn = false;
    this.versionOff = true;
  }
}
