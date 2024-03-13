import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { addDays } from 'date-fns';
import { ObjectStorageCreate } from 'src/app/shared/models/object-storage.model';

@Component({
  selector: 'one-portal-object-storage-extend',
  templateUrl: './object-storage-extend.component.html',
  styleUrls: ['../object-storage.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectStorageExtendComponent implements OnInit {
  issuedDate: Date = new Date();
  numberMonth: number = 1;
  expiredDate: Date = addDays(this.issuedDate, 30);
  objectStorageCreate: ObjectStorageCreate = new ObjectStorageCreate();

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  onChangeTime() {
    let lastDate = new Date();
    lastDate.setDate(this.issuedDate.getDate() + this.numberMonth * 30);
    this.expiredDate = lastDate;
  }

  totalAmount: number = 0;
  totalincludesVAT: number = 0;
  getTotalAmout() {}

  extend() {}
 
}
