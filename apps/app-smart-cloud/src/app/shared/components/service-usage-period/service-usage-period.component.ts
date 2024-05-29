import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { addDays } from 'date-fns';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'one-portal-service-usage-period',
  templateUrl: './service-usage-period.component.html',
  styleUrls: ['./service-usage-period.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceUsagePeriodComponent implements OnInit {
  @Input() nameService;
  @Output() valueChanged = new EventEmitter();

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

  constructor(
    private cdr: ChangeDetectorRef,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {}

  name: string = '';
  ngOnInit(): void {
    this.onChangeTime();
    this.name = this.i18n.fanyi('app.' + this.nameService);
  }

  today: Date = new Date();
  numberMonth: number = 1;
  expiredDate: Date = addDays(this.today, 30);
  dataSubjectTime: Subject<any> = new Subject<any>();
  changeTime(value: number) {
    this.dataSubjectTime.next(value);
  }
  onChangeTime() {
    this.dataSubjectTime
      .pipe(
        debounceTime(500) // Đợi 500ms sau khi người dùng dừng nhập trước khi xử lý sự kiện
      )
      .subscribe((res) => {
        this.valueChanged.emit(res);
        let currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + this.numberMonth * 30);
        this.expiredDate = currentDate;
        this.cdr.detectChanges();
      });
  }
}
