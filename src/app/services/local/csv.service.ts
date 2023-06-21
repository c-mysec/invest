import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CsvService {

  constructor() { }
  getData(csv : string) : Map<string, QuoteData> {
    const lines = csv.split('\n');
    const quoteData : Map<string, QuoteData> = new Map();
    lines.forEach(line => {
      let part = line.split(',');
      let vol = 0;
      let sufix = part[5][part[5].length-1];
      if (sufix == 'M') {
        part[5] = part[5].replace('M', '');
        vol = Number(part[5]) * 1000000;
      } else if (sufix == 'K') {
        part[5] = part[5].replace('K', '');
        vol = Number(part[5]) * 1000;
      } else {
        vol = Number(part[5]);
      }
      const quote = {
        date : part[0],
        close: Number(part[1]),
        open: Number(part[2]),
        max: Number(part[3]),
        min: Number(part[4]),
        volume: vol,
        var: Number(part[6])
      };
      quoteData.set(part[0], quote);
    });
    return quoteData;
  }
}
export interface QuoteData {
  date : string,
  close: number,
  open: number,
  max: number,
  min: number,
  volume: number,
  var : number
}
