import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InstancesDetailComponent } from './instances-detail.component';

describe('InstancesDetailComponent', () => {
  let component: InstancesDetailComponent;
  let fixture: ComponentFixture<InstancesDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InstancesDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InstancesDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
