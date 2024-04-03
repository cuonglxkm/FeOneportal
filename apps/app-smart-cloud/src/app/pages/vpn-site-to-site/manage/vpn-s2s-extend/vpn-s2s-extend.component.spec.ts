import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VpnS2sExtendComponent } from './vpn-s2s-extend.component';

describe('VpnS2sExtendComponent', () => {
  let component: VpnS2sExtendComponent;
  let fixture: ComponentFixture<VpnS2sExtendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VpnS2sExtendComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VpnS2sExtendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
