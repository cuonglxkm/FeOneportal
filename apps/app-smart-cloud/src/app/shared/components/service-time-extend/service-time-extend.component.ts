import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import { addDays } from 'date-fns';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'one-portal-service-time-extend',
  templateUrl: './service-time-extend.component.html',
  styleUrls: ['./service-time-extend.component.less']
})
export class ServiceTimeExtendComponent implements OnInit {
  @Input() createDate: Date;
  @Input() expiredDate: Date;
  @Output() valueChanged = new EventEmitter();

  dataSubjectTime: Subject<any> = new Subject<any>();
  today: Date = new Date();
  numberMonth: number = 1;
  newExpiredDate: Date = addDays(this.today, 30);

  constructor(private cdr: ChangeDetectorRef,
              private datePipe: DatePipe) {}

  onKeyDown(event: KeyboardEvent) {
    // Lấy giá trị của phím được nhấn
    const key = event.key;
    // Kiểm tra xem phím nhấn có phải là một số hoặc phím di chuyển không
    if (
      (isNaN(Number(key)) &&
        key !== 'Backspace' &&
        key !== 'Delete' &&
        key !== 'ArrowLeft' &&
        key !== 'ArrowRight') ||
      key === '.'
    ) {
      // Nếu không phải số hoặc đã nhập dấu chấm và đã có dấu chấm trong giá trị hiện tại
      event.preventDefault(); // Hủy sự kiện để ngăn người dùng nhập ký tự đó
    }
  }

  changeTime(value) {
    this.dataSubjectTime.next(value);
  }

  onChangeTime() {
    this.dataSubjectTime.pipe(debounceTime(500))
      .subscribe((res) => {
        this.valueChanged.emit(res);
        let expiredDate = new Date(this.expiredDate.getDate());
        expiredDate.setDate(expiredDate.getDate() + this.numberMonth * 30);
        this.newExpiredDate = expiredDate;
        this.cdr.detectChanges();
      });
  }

  ngOnInit(): void {
    this.onChangeTime();

    console.log('createdDate', this.createDate);
    console.log('expiredDate', this.expiredDate);
  }

}
