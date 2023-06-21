import { Injectable } from '@angular/core';
import { YfTickerCloseResult } from './yahoo-finance.service';

@Injectable({
  providedIn: 'root'
})
export class CalcInvestCotasService {

  constructor() { }
  initInvestment(tickers: string[], taxes : string[]) : CiInvestment {
    const inv : CiInvestment = {
      invQuotes: new Map(),
      invTaxes: new Map()
    };
    tickers.forEach((ticker) => {
      inv.invTaxes.set(ticker, {
        inv : new Map<string, number>(),
        percentage: 0
      });

    });
    return inv;
  }
  buy(buyValue: number, investment : CiInvestment, date : Date, quotes: Map<string, Map<string, YfTickerCloseResult>>) : Date{
    const offset = date.getTimezoneOffset()
    date = new Date(date.getTime() - (offset*60*1000))
    return this.invest(buyValue, investment, date.toISOString().split('T')[0], quotes);
  }
  calcFixedFraction(buyValue: number, investment : CiInvestment) : [Map<string, number>, Map<string, number>] {
    // descobre quanto vai pra cada investimento.
    // politica 1 - proporção fixa
    let quotesBuyFraction : Map<string, number> = new Map();
    let taxesBuyFraction : Map<string, number> = new Map();
    let total = 0;
    investment.invQuotes.forEach((quote, ticker) => {
      quotesBuyFraction.set(ticker, (quote.percentage / 100) * buyValue);
      total += (quote.percentage / 100) * buyValue;
    });
    investment.invTaxes.forEach((tax, ticker) => {
      taxesBuyFraction.set(ticker, (tax.percentage / 100) * buyValue);
      total += (tax.percentage / 100) * buyValue;
    });
    if (total != buyValue) {
      console.log('erro: total ('+total+') != buyValue ('+buyValue+')');
    }
    return [quotesBuyFraction, taxesBuyFraction];
  }
  investOneQuote(buyValue: number, investment : CiInvestmentQuote, date : string, quotes: Map<string, YfTickerCloseResult>) {
    let quote = quotes.get(date);
    const dateD = new Date(date);
    const lastQuoteDate = Array.from(quotes.keys()).pop() ?? (new Date()).toISOString().split('T')[0];
    while (quote == undefined) {
      dateD.setDate(dateD.getDate() + 1);
      date = dateD.toISOString().split('T')[0];
      if (date > lastQuoteDate) {
        quote = undefined;
        break;
      }
      quote = quotes.get(date);
    }
    let quoteMin = quote;
    const prefix = date.substring(0, 8); // 2023-01-01
    for (let i = 1; i <= 31; i++) {
      const day = (i < 10 ? '0' : '') + i;
      const q = quotes.get(prefix + day);
      if (q && q.adjClose < (quote?.adjClose ?? 0)) quoteMin = q;
    }
    let lastEntry = Array.from(investment.inv.values()).pop() ?? {numQuotes: 0, value: 0, numQuotesMin: 0, valueMin: 0, valueRaw: 0, buyQuotes: 0, buyValue: 0};
    if (quote) {
      let buyQuotes = Math.floor(buyValue / quote.adjClose);
      let buyQuotesMin = Math.floor(buyValue / (quoteMin?.adjClose ?? 1));

      investment.inv.set(date, {
        numQuotes : buyQuotes + lastEntry.numQuotes,
        value: (buyQuotes + lastEntry.numQuotes) * quote.adjClose,
        numQuotesMin : buyQuotesMin + lastEntry.numQuotesMin,
        valueMin: (buyQuotesMin + lastEntry.numQuotesMin) * quote.adjClose,
        valueRaw: lastEntry.valueRaw + buyValue,
        buyQuotes : buyQuotes,
        buyValue: buyQuotes * quote.adjClose,
      });
    }
    return dateD;
  }
  investOneTax(buyValue: number, investment : CiInvestmentTax, date : string, taxes: Map<string, number>) {
    let tax = taxes.get(date);
    const dateD = new Date(date);
    const lastTaxDate = Array.from(taxes.keys()).pop() ?? (new Date()).toISOString().split('T')[0];
    while (tax == undefined) {
      dateD.setDate(dateD.getDate() + 1);
      date = dateD.toISOString().split('T')[0];
      if (date > lastTaxDate) {
        tax = undefined;
        break;
      }
      tax = taxes.get(date);
    }
    let lastEntry = Array.from(investment.inv.values()).pop() ?? 0;
    if (tax) {
      investment.inv.set(date, lastEntry * tax + buyValue);
    }
    return dateD;
  }
  invest(buyValue: number, investment : CiInvestment, date : string, quotes: Map<string, Map<string, YfTickerCloseResult>>) : Date {
    // default, calcula por fracionamento fixo.
    let [quotesBuyFraction, taxesBuyFraction] = this.calcFixedFraction(buyValue, investment);
    let date2 = new Date(date);
    investment.invQuotes.forEach((quote, ticker) => {
      date2 = this.investOneQuote(quotesBuyFraction.get(ticker)??0, quote, date, quotes.get(ticker) ?? new Map());
    });
    investment.invTaxes.forEach((tax, ticker) => {
      date2 = this.investOneTax(taxesBuyFraction.get(ticker)??0, tax, date, quotes.get(ticker) ?? new Map());
    });
    return date2;

  }
  buySave(buyValue: number, investment : Map<string, CiInvestmentEntry>, date : Date, map: Map<string, YfTickerCloseResult>) : Date{
    const offset = date.getTimezoneOffset()
    date = new Date(date.getTime() - (offset*60*1000))
    return this.save(buyValue, investment, date.toISOString().split('T')[0], map);
  }
  save(buyValue: number, investment : Map<string, CiInvestmentEntry>, date : string, map: Map<string, YfTickerCloseResult>) : Date{
    let quote = map.get(date);
    const dateD = new Date(date);
    const lastQuoteDate = Array.from(map.keys()).pop() ?? (new Date()).toISOString().split('T')[0];
    while (quote == undefined) {
      dateD.setDate(dateD.getDate() + 1);
      date = dateD.toISOString().split('T')[0];
      quote = map.get(date);
      if (date > lastQuoteDate) {
        quote = undefined;
        break;
      }
    }
    if (quote) {
      let lastEntry = Array.from(investment.values()).pop() ?? {numQuotes: 0, value: 0, buyQuotes: 0, buyValue: 0, investPercent: 0};
      investment.set(date, {
        numQuotes : buyValue + lastEntry.numQuotes,
        value: (buyValue + lastEntry.numQuotes),
        numQuotesMin : 0,
        valueMin: 0,
        valueRaw: 0,
        buyQuotes : buyValue,
        buyValue: buyValue,
      });
    }
    return dateD;
  }
}
export interface CiInvestment {
  invQuotes: Map<string, CiInvestmentQuote>,
  invTaxes : Map<string, CiInvestmentTax>
}
export interface CiInvestmentQuote {
  inv : Map<string, CiInvestmentEntry>,
  percentage: number
}
export interface CiInvestmentTax {
  inv : Map<string, number>,
  percentage: number
}
export interface CiInvestmentEntry {
  numQuotes : number,
  value: number,

  // pela menor cotação do mês
  numQuotesMin : number,
  valueMin: number,

  valueRaw: number,

  buyQuotes: number,
  buyValue: number,
}
