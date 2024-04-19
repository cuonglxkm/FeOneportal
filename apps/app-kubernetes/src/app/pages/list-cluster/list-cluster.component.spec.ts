import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListClusterComponent } from './list-cluster.component';

describe('KubernetesDetailComponent', () => {
  let component: ListClusterComponent;
  let fixture: ComponentFixture<ListClusterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListClusterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListClusterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
