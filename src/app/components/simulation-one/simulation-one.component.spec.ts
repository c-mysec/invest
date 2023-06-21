import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulationOneComponent } from './simulation-one.component';

describe('SimulationOneComponent', () => {
  let component: SimulationOneComponent;
  let fixture: ComponentFixture<SimulationOneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimulationOneComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimulationOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
