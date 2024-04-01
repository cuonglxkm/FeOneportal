import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { addDays } from 'date-fns';
import { ObjectStorageCreate } from 'src/app/shared/models/object-storage.model';

@Component({
  selector: 'one-portal-object-storage-edit',
  templateUrl: './object-storage-edit.component.html',
  styleUrls: ['./object-storage-edit.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectStorageEditComponent implements OnInit {
  today: Date = new Date();
  numberMonth: number = 1;
  expiredDate: Date = addDays(this.today, 30);
  objectStorageCreate: ObjectStorageCreate = new ObjectStorageCreate();

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  onChangeTime() {
    let lastDate = new Date();
    lastDate.setDate(this.today.getDate() + this.numberMonth * 30);
    this.expiredDate = lastDate;
  }

  totalAmount: number = 0;
  totalincludesVAT: number = 0;
  getTotalAmout() {}

  create() {}
}
