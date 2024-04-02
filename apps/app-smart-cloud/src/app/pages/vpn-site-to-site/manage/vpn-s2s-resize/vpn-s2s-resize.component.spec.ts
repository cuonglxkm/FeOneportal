import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VpnS2sResizeComponent } from './vpn-s2s-resize.component';

describe('VpnS2sResizeComponent', () => {
  let component: VpnS2sResizeComponent;
  let fixture: ComponentFixture<VpnS2sResizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VpnS2sResizeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VpnS2sResizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
