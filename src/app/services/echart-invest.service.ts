import { Injectable } from '@angular/core';
import { getNextWorkingDay  } from 'bank-calendar'
@Injectable({
  providedIn: 'root'
})
export class EchartInvestService {

  constructor() { }
  getInvestChartOption(series: string[], min: number, max: number, start: Date, end: Date) {
    const source : any[] = [];
    let date = new Date(start.getTime());
    while (date <= end) {
      source.push({'date': date.toISOString().split('T')[0]});
      date.setDate(date.getDate() + 1);
      date = getNextWorkingDay(date);
    }
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
          position: 'left',
          min: min,
          max: max,
          axisLabel: {
            formatter: '{value} R$'
          }
        }
      ],
      series: [
      ],
      dataset: {
        dimensions: ['date'],
        source: source
      }
    };
    series.forEach((entry: string) => {
      const serie : any = {
        type: 'line',
      };
      options.series.push(serie);
      options.dataset.dimensions.push(entry);
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
}
