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
import { FormGroup, FormControl, Validators } from '@angular/forms';
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

  form = new FormGroup({
    time: new FormControl('', {
      validators: [Validators.required],
    }),
  });

  onKeyDown(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;
    const currentValue = inputElement.value;

    // Cho phép các phím đặc biệt
    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
    ];

    // Kiểm tra nếu phím không phải là số, không phải các phím đặc biệt, hoặc là số 0 ở đầu
    if (
      (!allowedKeys.includes(key) && isNaN(Number(key))) ||
      (key === '0' && currentValue.length === 0)
    ) {
      event.preventDefault();
      // Hủy sự kiện để ngăn người dùng nhập ký tự đó
    }

    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value + event.key);
    if (value < 1 && event.key !== 'Backspace' && event.key !== 'Delete') {
      event.preventDefault();
    }

    // Kiểm tra nếu nhập vượt quá 100
    const newValue = currentValue + key;
    if (Number(newValue) > 100) {
      event.preventDefault(); // Hủy sự kiện để ngăn người dùng nhập ký tự đó
    }
  }

  onInput(event: any) {
    if (event.target.value === '0') {
      this.numberMonth = 1;
      event.target.value = 1;
      this.dataSubjectTime.next(this.numberMonth);
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
  changeTime(value) {
    console.log('value', value);
    if (value == '') {
      this.numberMonth = undefined;
    } else if (value < 1) {
      this.numberMonth = 1;
    } else {
      this.numberMonth = value;
    }
    console.log('month', this.numberMonth);
    this.dataSubjectTime.next(this.numberMonth);
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
