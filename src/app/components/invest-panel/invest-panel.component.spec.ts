import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestPanelComponent } from './invest-panel.component';

describe('InvestPanelComponent', () => {
  let component: InvestPanelComponent;
  let fixture: ComponentFixture<InvestPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvestPanelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
