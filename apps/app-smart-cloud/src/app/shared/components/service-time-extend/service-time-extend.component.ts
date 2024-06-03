import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import { addDays } from 'date-fns';

@Component({
  selector: 'one-portal-service-time-extend',
  templateUrl: './service-time-extend.component.html',
  styleUrls: ['./service-time-extend.component.less']
})
export class ServiceTimeExtendComponent implements OnInit {
  @Input() createDate: any;
  @Input() expiredDate: any;
  @Output() valueChanged = new EventEmitter();

  dataSubjectTime: Subject<any> = new Subject<any>();
  numberMonth: number = 1;
  newExpiredDate: any;

  constructor(private cdr: ChangeDetectorRef) {
  }

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
        console.log(res);
        this.valueChanged.emit(res);
        let expiredDate = new Date(this.expiredDate);
        expiredDate.setDate(expiredDate.getDate() + this.numberMonth * 30);
        this.newExpiredDate = expiredDate.toISOString().substring(0, 19);
        this.cdr.detectChanges();
      });
  }

  ngOnInit(): void {
    let expiredDate = new Date(this.expiredDate);
    expiredDate.setDate(expiredDate.getDate() + this.numberMonth * 30);
    this.newExpiredDate = expiredDate.toISOString().substring(0, 19);
    console.log('new', this.newExpiredDate)
    this.onChangeTime();
  }

}
