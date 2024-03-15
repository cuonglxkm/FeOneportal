import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailClusterComponent } from './detail-cluster.component';

describe('DetailClusterComponent', () => {
  let component: DetailClusterComponent;
  let fixture: ComponentFixture<DetailClusterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetailClusterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailClusterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
