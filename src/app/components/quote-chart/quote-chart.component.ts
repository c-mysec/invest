import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EchartQuotesService, QuoteChartPointers } from 'src/app/services/echartQuotes.service';
import { QuotesService } from 'src/app/services/local/quotes.service';
import { QuoteData } from 'src/app/services/local/csv.service';
@Component({
  selector: 'app-quote-chart',
  templateUrl: './quote-chart.component.html',
  styleUrls: ['./quote-chart.component.scss']
})
export class QuoteChartComponent implements OnInit, OnChanges {
  quotesChartOption: any;
  ibovSeries : Map<string, QuoteData> = new Map();
  series : Map<string, Map<string, QuoteData>> = new Map();
  cdiSeries !: Map<string, number>;

  @Input() start: string = '2010-01-01'; // menor valor é a partir de 2008
  @Input() end: string = '2023-04-24';
  @Input() tickers: string[] = ['BBDC4.SA'];

  constructor(private quotesService : QuotesService,
    private echartQuotesService : EchartQuotesService) {
  }
  async ngOnInit() {
    const ibovTicker = '^BVSP';
    const year = new Date().getFullYear();
    const startyear = new Date(this.start+"T04:00:00").getFullYear();
    this.ibovSeries = this.quotesService.getData('IBOV') ?? new Map<string, QuoteData>();
    this.tickers.forEach(ticker => {
      this.series.set(ticker, this.quotesService.getData(ticker) ?? new Map<string, QuoteData>());
    });

    let quoteChartPointers : QuoteChartPointers = await this.chartQuotes();
    while (this.echartQuotesService.addPoints(quoteChartPointers));
  }
  ngOnChanges(changes: SimpleChanges) {
    //throw new Error('Method not implemented.');
  }
  async chartQuotes() : Promise<QuoteChartPointers> {
    const optionsAxis = [{label:'IBOV', yValor: false}];
    for (let j = 0; j < this.tickers.length; j++) optionsAxis.push({label:this.tickers[j], yValor: true});
    this.quotesChartOption = this.echartQuotesService.getQuotesValueChartOption(optionsAxis);
    const iIbov = this.ibovSeries.keys();
    const itickers = Array.from(this.series.values()).map(entry => entry.keys());
    const nexts : IteratorResult<string, any>[] = itickers.map(it => it.next());
    let quoteChartPointers : QuoteChartPointers = {
      labels: ['IBOV', ...this.tickers],
      series: [this.ibovSeries, ...Array.from(this.series.values())],
      iterators: [iIbov, ...itickers],
      next: [iIbov.next(), ...nexts],
      source: this.quotesChartOption.dataset.source,
      finished: false
    };
    return quoteChartPointers;
  }
}
