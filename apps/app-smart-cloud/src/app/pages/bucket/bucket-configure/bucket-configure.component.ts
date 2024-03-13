import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'one-portal-bucket-configure',
  templateUrl: './bucket-configure.component.html',
  styleUrls: ['../bucket-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BucketConfigureComponent implements OnInit {
  ngOnInit(): void {
    throw new Error('Method not implemented.');
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
