import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Aporte } from 'src/app/model/aporte';
import { getNextWorkingDay  } from 'bank-calendar'

@Component({
  selector: 'app-simulation-one',
  templateUrl: './simulation-one.component.html',
  styleUrls: ['./simulation-one.component.scss']
})
export class SimulationOneComponent implements OnInit,AfterViewInit {
  start = "2010-01-01";
  end = "2023-04-24";
  maxValue = 350000;
  endDate = new Date(this.end);
  ticker = "BBDC4.SA";
  tickers = ["BBDC4.SA","ITUB4.SA", "SAPR4.SA"];
  aporte : Aporte = {
    date : new Date(this.start),
    value : 1000
  };
  ngOnInit() {
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.scheduleUpdate();
      //while (this.update());
      console.log("done");
    }, 1000);
  }
  scheduleUpdate() {
    setTimeout(() => {
      if (this.update()) this.scheduleUpdate();
    }, 100);
  }
  update() : boolean {
    let date = this.aporte.date;
    date.setMonth(date.getMonth() + 1);
    date.setDate(1);
    date = getNextWorkingDay(date);
    if (date < this.endDate) {
      this.aporte = { date : date, value: this.aporte.value};
      return true;
    }
    this.aporte = { date : date, value: 0};
    return false;
  }
}
