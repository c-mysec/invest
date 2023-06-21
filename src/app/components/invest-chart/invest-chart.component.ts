import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Aporte } from 'src/app/model/aporte';
import { BancoCentralService } from 'src/app/services/banco-central.service';
import { CalcInvestCotasService, CiInvestment, CiInvestmentEntry } from 'src/app/services/calc-invest-cotas.service';
import { EchartInvestService } from 'src/app/services/echart-invest.service';
import { YahooFinanceService, YfTickerCloseResult } from 'src/app/services/yahoo-finance.service';

@Component({
  selector: 'app-invest-chart',
  templateUrl: './invest-chart.component.html',
  styleUrls: ['./invest-chart.component.scss']
})
export class InvestChartComponent implements OnInit, OnChanges {
  invChartOption: any;
  series : Map<string, Map<string, YfTickerCloseResult>> = new Map();
  investment !: CiInvestment;
  cdiSeries !: Map<string, number>;
  ipcaSeries = new Map<string, number>();
  investChartPointers !: InvestChartPointers;
  @Input() aporte!: Aporte;
  @Input() start: string = '2010-01-01'; // menor valor é a partir de 2008
  @Input() end: string = '2023-04-24';
  @Input() tickers: string[] = ['BBDC4.SA'];
  @Input() maxValue: number = 100000;
  initialized : boolean = false;
  lastItem : any = {};

  constructor(private yservice : YahooFinanceService,
    private invService: CalcInvestCotasService,
    private bcbService : BancoCentralService,
    private echartInvestService: EchartInvestService) {
  }
  async ngOnInit() {
    const year = new Date().getFullYear();
    const startyear = new Date(this.start+"T04:00:00").getFullYear();
    for (let ticker of this.tickers) {
      let serie : Map<string, YfTickerCloseResult> = new Map();
      this.series.set(ticker, serie);
      for (let i = startyear; i <= year-1; i++) {
        await this.yservice.getTickerYearClose(serie, ticker, i, true, true);
      }
      await this.yservice.getTickerThisYearClose(serie, ticker, true, true);
    };
    for (let i = startyear; i <= year-1; i++) {
      const map = await this.bcbService.getIPCA(i);
      this.ipcaSeries = new Map([...this.ipcaSeries, ...map]);
    }
    let startDate = new Date(this.start);
    let endDate = new Date(this.end);

    const map = await this.bcbService.getIPCA(year);
    this.ipcaSeries = new Map([...this.ipcaSeries, ...map]);
    this.investment = this.invService.initInvestment(this.tickers, ['CDI', 'IPCA', 'Savings']);
    this.cdiSeries = await this.bcbService.getCDI(startDate, endDate, false);
    this.invChartOption = this.echartInvestService.getInvestChartOption([...this.tickers, 'CDI', 'IPCA', 'Savings'], 0, this.maxValue, startDate, endDate);

    this.investChartPointers = {
      serie: this.investment,
      cdiSeries: this.cdiSeries,
      cdiTotal : 0,
      ipcaSeries: this.ipcaSeries,
      ipcaTotal : 0,
      source: this.invChartOption.dataset.source,
    }
    this.initialized = true;
  }
  ngOnChanges(changes: SimpleChanges) {
    if (!this.initialized) return;
    const aporte : Aporte = changes['aporte'].currentValue;
    this.addPoint(aporte);
  }
  addPoint(aporte : Aporte) {
    const date = this.invService.buy(aporte.value, this.investment, aporte.date, this.series);
    const sdate = date.toISOString().split('T')[0];
    this.investChartPointers.serie.invQuotes.forEach((invQuote, ticker) => {
      this.investChartPointers.source.forEach((item:any) => {
        if (item['date'] <= sdate) {
          this.lastItem[ticker] = item[ticker] = item[ticker] ?? invQuote.inv.get(sdate)?.value ?? this.lastItem[ticker] ?? 0;
        }
      });
    });
    this.investChartPointers.serie.invQuotes.forEach((invQuote, ticker) => {
      this.investChartPointers.source.forEach((item:any) => {
        if (item['date'] <= sdate) {
          this.lastItem[ticker] = item[ticker] = item[ticker] ?? invQuote.inv.get(sdate)?.value ?? this.lastItem[ticker] ?? 0;
        }
      });
    });
    const k = sdate.substring(0, 8) + '01'; // 2023-01- ---- por que só temos o CDI mensal e no dia 1.
    this.investChartPointers.cdiTotal += (this.investChartPointers.cdiTotal * (this.investChartPointers.cdiSeries.get(k) ?? 0) / 100) + aporte.value;
    this.investChartPointers.ipcaTotal += (this.investChartPointers.ipcaTotal * (this.investChartPointers.ipcaSeries.get(k) ?? 0) / 100) + aporte.value;
    this.investChartPointers.source.forEach((item:any) => {
      if (item['date'] <= sdate) {
        this.lastItem[this.ticker] = item[this.ticker] = item[this.ticker] ?? value;
        this.lastItem[this.ticker + ' Min'] = item[this.ticker + ' Min'] = item[this.ticker + ' Min'] ?? minValue;
        this.lastItem['CDI'] = item['CDI'] = item['CDI'] ?? this.investChartPointers.cdiTotal;
        this.lastItem['IPCA'] = item['IPCA'] = item['IPCA'] ?? this.investChartPointers.ipcaTotal;
        this.lastItem['Savings'] = item['Savings'] = item['Savings'] ?? rawValue;
        this.invChartOption = { ...this.invChartOption }; // to trigger chart update
      }
    });
    this.invChartOption = { ...this.invChartOption }; // to trigger chart update
  }
}
interface InvestChartPointers {
  serie: CiInvestment,
  cdiSeries: Map<string, number>,
  cdiTotal : number,
  ipcaSeries: Map<string, number>,
  ipcaTotal : number,
  source: any
}
interface InvestChartParams {
  investChartPointers: InvestChartPointers,
  saving: number,
  finished : boolean
}

