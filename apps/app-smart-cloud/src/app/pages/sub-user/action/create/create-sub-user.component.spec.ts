import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateSubUserComponent } from './create-sub-user.component';

describe('CreateSubUserComponent', () => {
  let component: CreateSubUserComponent;
  let fixture: ComponentFixture<CreateSubUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateSubUserComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateSubUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
