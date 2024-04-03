import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VpnS2sCreateComponent } from './vpn-s2s-create.component';

describe('VpnS2sCreateComponent', () => {
  let component: VpnS2sCreateComponent;
  let fixture: ComponentFixture<VpnS2sCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VpnS2sCreateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VpnS2sCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
