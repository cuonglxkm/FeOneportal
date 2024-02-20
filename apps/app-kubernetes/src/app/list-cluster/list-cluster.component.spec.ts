import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KubernetesDetailComponent } from './list-cluster.component';

describe('KubernetesDetailComponent', () => {
  let component: KubernetesDetailComponent;
  let fixture: ComponentFixture<KubernetesDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KubernetesDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(KubernetesDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
