import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InstancesBtnComponent } from './instances-btn.component';

describe('InstancesBtnComponent', () => {
  let component: InstancesBtnComponent;
  let fixture: ComponentFixture<InstancesBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InstancesBtnComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InstancesBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
