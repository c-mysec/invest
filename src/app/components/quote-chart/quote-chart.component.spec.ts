import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteChartComponent } from './quote-chart.component';

describe('QuoteChartComponent', () => {
  let component: QuoteChartComponent;
  let fixture: ComponentFixture<QuoteChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuoteChartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuoteChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
