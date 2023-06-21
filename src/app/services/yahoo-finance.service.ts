import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { withCache } from '@ngneat/cashew';
import { Observable, throwError, firstValueFrom } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class YahooFinanceService {
  // S&P500: ^GSPC IBOV: ^BVSP CASH3.SA JNJ
  urlQuotes : string = 'http://localhost:8080/https://query1.finance.yahoo.com/v8/finance/chart/{{ticker}}?interval=1d&period1={{start}}&period2={{end}}&includePrePost=false';
  urlDivdends : string = 'http://localhost:8080/https://query1.finance.yahoo.com/v7/finance/download/{{ticker}}?interval=1d&period1={{start}}&period2={{end}}&events=div&includePrePost=false';
  urlSplits : string = 'http://localhost:8080/https://query1.finance.yahoo.com/v7/finance/download/{{ticker}}?interval=1d&period1={{start}}&period2={{end}}&events=split&includePrePost=false';

  constructor(private http: HttpClient) { }
  fromUnixTS(ts : number) : string {
    const d = new Date(ts * 1000);
    let datestring = d.getFullYear() + '-' + ("0"+(d.getMonth()+1)).slice(-2) + '-' + ("0" + d.getDate()).slice(-2);
    return datestring;
  }
  toUnixTS(date : Date) : string {
    return ''+Math.floor(date.getTime() / 1000);
  }
  async getQuotes(ticker : string, start : Date, end : Date) : Promise<YfResponse> {
    // now returns an Observable of Config
    let that = this;
    try {
      return await firstValueFrom(
        this.http.get<YfResponse>(
              this.urlQuotes.replace('{{ticker}}', ticker).replace('{{start}}', this.toUnixTS(start)).replace('{{end}}', this.toUnixTS(end)),
              {
                context: withCache()
              }
        )
      );
    } catch (e) {
      return {
        "chart": {
          "result": [
              {
                  "meta": {
                    currency: "BRL",
                    symbol: "",
                    exchangeName: "SAO",
                    instrumentType: "INDEX",
                    firstTradeDate: 0,
                    regularMarketTime: 0,
                    gmtoffset: -10800,
                    timezone: "BRT",
                    exchangeTimezoneName: "America/Sao_Paulo",
                    regularMarketPrice: 0,
                    chartPreviousClose: 0,
                    priceHint: 0,
                    currentTradingPeriod: {
                      pre : {
                        timezone: "BRT",
                        end: 1681995600,
                        start: 1681994700,
                        gmtoffset: -10800
                      },
                      regular : {
                        timezone: "BRT",
                        end: 1681995600,
                        start: 1681994700,
                        gmtoffset: -10800
                      },
                      post : {
                        timezone: "BRT",
                        end: 1681995600,
                        start: 1681994700,
                        gmtoffset: -10800
                      }
                    },
                    dataGranularity: "1mo",
                    range: "max",
                    validRanges: [] // [ "1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max" ]
                  },
                  "timestamp": [],
                  "indicators": {
                    quote : [{
                      volume : [0],
                      open : [0],
                      high : [0],
                      low : [0],
                      close : [0]
                    }],
                    adjclose : [
                      {
                        adjclose: [0]
                      }
                    ]
                  }
              }
          ],
          error: ''
        }
      };
    }
  }
  async getDividends(ticker : string, map: Map<string, YfTickerCloseResult>, start : Date, end : Date) {
    try {
      const divs = await firstValueFrom(
        this.http.get(this.urlDivdends.replace('{{ticker}}', ticker).replace('{{start}}', this.toUnixTS(start)).replace('{{end}}', this.toUnixTS(end)),
          {
            responseType: 'text',
            context: withCache()
          }
        )
      );
      let csvToRowArray = divs.split("\n");
      for (let index = 1; index < csvToRowArray.length; index++) {
        let row = csvToRowArray[index].split(",");
        let entry = map.get(row[0]);
        if (entry) {
          entry.dividend = true;
          entry.dividendAmount = Number(row[1]);
        } else {
          entry = {
            close: 0,
            adjClose: 0,
            dividend: true,
            split: false,
            dividendAmount: Number(row[1]),
            splitFactor: 0
          };
        }
      }
    } catch (e) {}
  }
  async getSplits(ticker : string, map: Map<string, YfTickerCloseResult>, start : Date, end : Date) {
    try {
      const splits = await firstValueFrom(
        this.http.get(
          this.urlSplits.replace('{{ticker}}', ticker).replace('{{start}}', this.toUnixTS(start)).replace('{{end}}', this.toUnixTS(end)),
          {
            responseType: 'text',
            context: withCache()
          }
        )
      );
      let csvToRowArray = splits.split("\n");
      for (let index = 1; index < csvToRowArray.length; index++) {
        let row = csvToRowArray[index].split(",");
        let entry = map.get(row[0]);
        let fators = row[1].split(':');
        let factor : number = Number(fators[0])/Number(fators[1]); // fator é a multiplicação que calcula o novo número de ações
        if (entry) {
          entry.split = true;
          entry.splitFactor = factor;
        } else {
          entry = {
            close: 0,
            adjClose: 0,
            dividend: false,
            split: true,
            dividendAmount: 0,
            splitFactor: factor
          };
        }
      }
    } catch (e) {}
  }
  async getTickerYearClose(res: Map<string, YfTickerCloseResult>, ticker: string, year: number, withDividends: boolean, withSplits: boolean): Promise<Map<string, YfTickerCloseResult>> {
    const start = new Date(year + '-01-01');
    const end = new Date(year + '-12-31');
    return await this.getTickerClose(res, ticker, start, end, withDividends, withSplits);
  }
  async getTickerThisYearClose(res: Map<string, YfTickerCloseResult>, ticker: string, withDividends: boolean, withSplits: boolean): Promise<Map<string, YfTickerCloseResult>> {
    const end1 = new Date();
    const end = new Date(end1.getFullYear(), end1.getMonth(), end1.getDate());
    const start = new Date(end.getFullYear() + '-01-01');
    return await this.getTickerClose(res, ticker, start, end, withDividends, withSplits);
  }
  async getTickerClose(res: Map<string, YfTickerCloseResult>, ticker: string, start: Date, end: Date, withDividends: boolean, withSplits: boolean): Promise<Map<string, YfTickerCloseResult>> {
    let data : YfResponse = await this.getQuotes(ticker, start, end);
    const len = data.chart.result[0].timestamp.length;
    let lastQuote = data.chart.result[0].indicators.quote[0].close[0];
    let lastAdjQuote = data.chart.result[0].indicators.adjclose[0].adjclose[0];
    for (let i = 0; i < len; i++) {
      const date : string = this.fromUnixTS(data.chart.result[0].timestamp[i]);
      let quote = data.chart.result[0].indicators.quote[0].close[i];
      let adjQuote = data.chart.result[0].indicators.adjclose[0].adjclose[i];
      if (quote < 1) quote = lastQuote;
      if (adjQuote < 1) adjQuote = lastAdjQuote;
      else lastQuote = quote;
      const entry : YfTickerCloseResult = {
        close: quote,
        adjClose: adjQuote,
        dividend: false,
        split: false,
        dividendAmount: 0,
        splitFactor: 0
      }
      res.set(date, entry);
      if (quote > 0) lastQuote = quote;
      if (adjQuote > 0) lastAdjQuote = adjQuote;
    }
    if (withDividends) await this.getDividends(ticker, res, start, end);
    if (withSplits) await this.getSplits(ticker, res, start, end);
    return res;
  }
  invest(amount : number, date: string, result: YfResult) {

  }
  /*
    options: {
      headers?: HttpHeaders | {[header: string]: string | string[]},
      observe?: 'body' | 'events' | 'response',
      params?: HttpParams|{[param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>},
      reportProgress?: boolean,
      responseType?: 'arraybuffer'|'blob'|'json'|'text',
      withCredentials?: boolean,
    };
    */
}
export interface YfTickerCloseResult {
  close: number,
  adjClose: number,
  split: boolean,
  splitFactor: number,
  dividend: boolean,
  dividendAmount: number
}
export interface YfResponse {
  chart : YfChart;
}
export interface YfChart {
  result : YfResult[];
  error : string;
}
export interface YfResult {
  meta : YfMeta;
  timestamp: number[];
  indicators: YfIndicator;
}
export interface YfMeta {
  currency: string; //  "BRL",
  symbol: string; // "^BVSP",
  exchangeName: string; // "SAO",
  instrumentType: string; // "INDEX",
  firstTradeDate: number; // 735915600,
  regularMarketTime: number; // 1682021940,
  gmtoffset: number; // -10800,
  timezone: string; // "BRT",
  exchangeTimezoneName: string; // "America/Sao_Paulo",
  regularMarketPrice: number; // 104366.82,
  chartPreviousClose: number; // 24.5,
  priceHint: number; // 2,
  currentTradingPeriod: YfTradingPeriod;
  dataGranularity: string; // "1mo",
  range: string; // "max",
  validRanges: string[]; // [ "1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max" ]
}
export interface YfTradingPeriod {
  pre : YfPeriod;
  regular : YfPeriod;
  post : YfPeriod;
}
export interface YfPeriod {
  timezone: string; // "BRT",
  end: number; // 1681995600,
  start: number; // 1681994700,
  gmtoffset: number; // -10800
}
export interface YfIndicator {
  quote : YfQuote[];
  adjclose : YfAdjclose[];
}
export interface YfQuote {
  volume : number[]; // [ 1, 3, 5, 66,7 ,8...]
  open : number[]; // [ 24.100000381469727,  35.400001525878906,  53.70000076293945,  65.5999984741211,  96.4000015258789, 146.60000610351562, 184.39999389648438, ...]
  high : number[]; // [ 24.100000381469727,  35.400001525878906,  53.70000076293945,  65.5999984741211,  96.4000015258789, 146.60000610351562, 184.39999389648438, ...]
  low : number[]; // [ 24.100000381469727,  35.400001525878906,  53.70000076293945,  65.5999984741211,  96.4000015258789, 146.60000610351562, 184.39999389648438, ...]
  close : number[]; // [ 24.100000381469727,  35.400001525878906,  53.70000076293945,  65.5999984741211,  96.4000015258789, 146.60000610351562, 184.39999389648438, ...]
}
export interface YfAdjclose {
  adjclose: number[]; // [ 24.100000381469727,  35.400001525878906,  53.70000076293945,  65.5999984741211,  96.4000015258789, 146.60000610351562, 184.39999389648438, ...]
}
export interface YfEvent {
  dividends: YfDividendList,
  splits: YfSplitList
}
export interface YfDividendList {
  [key: string]: YfDividend
}
export interface YfSplitList {
  [key: string]: YfSplit
}
export interface YfDividend {
  amount: number,
  date: number
}
export interface YfSplit {
  date: number
  numerator: number,
  denominator: number,
  splitRatio: string,
}
