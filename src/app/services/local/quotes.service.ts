import { Injectable } from '@angular/core';
import { CsvService, QuoteData } from './csv.service';
import { ibovData } from './quotes/ibov-data';
import { bbdc4Data } from './quotes/bbdc4-data';
import { itub4Data } from './quotes/itub4-data';
import { sapr4Data } from './quotes/sapr4-data';

@Injectable({
  providedIn: 'root'
})
export class QuotesService {
  series: Map<string, Map<string, QuoteData>> = new Map();
  constructor(private csvService: CsvService) {
    this.series.set('IBOV', this.csvService.getData(ibovData));
    this.series.set('BBDC4.SA', this.csvService.getData(bbdc4Data));
    this.series.set('ITUB4.SA', this.csvService.getData(itub4Data));
    this.series.set('SAPR4.SA', this.csvService.getData(sapr4Data));
  }
  getData(ticker : string) : Map<string, QuoteData> | undefined {
    return this.series.get(ticker);
  }
}
