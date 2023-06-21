import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestChartComponent } from './invest-chart.component';

describe('InvestChartComponent', () => {
  let component: InvestChartComponent;
  let fixture: ComponentFixture<InvestChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvestChartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
