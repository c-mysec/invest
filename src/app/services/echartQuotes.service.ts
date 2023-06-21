import { Injectable } from '@angular/core';
import { QuoteData } from './local/csv.service';

@Injectable({
  providedIn: 'root'
})
export class EchartQuotesService {

  constructor() { }
  getQuotesValueChartOption(series: EchartSerieConfig[]) {
    const options : any = {
      legend: {
        orient: 'horizontal',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        valueFormatter: (value: number) => 'R$ ' + (value ? value.toFixed(2).replace('.',','):'x')
      },
      xAxis: {
        type: 'category',
      },
      yAxis:[
        {
          type: 'value',
          name: 'pontos',
          position: 'left',
          axisLabel: {
            formatter: '{value}'
          }
        },
        {
          type: 'value',
          name: 'valor',
          position: 'right',
          axisLabel: {
            formatter: '{value} R$'
          }
        }
      ],
      series: [],
      dataset: {
        dimensions: ['date'],
        source: [
          // { 'date':date,  'IBOV':111, 'BBDC4':222 }
        ]
      }
    }
    series.forEach((entry: EchartSerieConfig) => {
      const serie : any = {
        type: 'line',
        yAxisIndex: entry.yValor ? 1 : 0
      };
      if (entry.yValor) serie['tooltip'] = {
        valueFormatter: (value: number) => 'R$' + value.toFixed(2).replace('.',',')
      };
      options.series.push(serie);
      options.dataset.dimensions.push(entry.label);
    });
    return options;
  }
  getMin(arr : string[]) : string {
    let minV = arr[0];
    for (const a of arr) {
      if (a < minV) minV = a;
    }
    return minV;
  }
  isDone = (iterators : any[]) => iterators.every(e => e.done);
  addPoints(quoteChartPointers : QuoteChartPointers) : boolean {
    if (this.isDone(quoteChartPointers.next)) return false;
    const keys = quoteChartPointers.next.map((item: IteratorResult<string, any>) => item.value);
    const quotes: number[] = keys.map((key: string, i: number) => quoteChartPointers.series[i].get(key)?.close ?? 0);
    const minKey = this.getMin(keys);
    let sourceItem : any = {};
    sourceItem['date'] = minKey;
    quoteChartPointers.labels.forEach((label: string, index : number) => {
      if (keys[index] <= minKey) {
        sourceItem[label] = quotes[index];
        quoteChartPointers.next[index] = quoteChartPointers.iterators[index].next();
      }
    });
    quoteChartPointers.source.push(sourceItem);
    return true;
  }
}
export interface EchartSerieConfig {
  label: string,
  yValor: boolean // se o y significa valor (true) ou pontos (false)
}
export interface QuoteChartPointers {
  labels: string[],
  series: Map<string, QuoteData>[],
  iterators: IterableIterator<string>[],
  next: IteratorResult<string, any>[],
  source: any,
  finished: boolean
};
