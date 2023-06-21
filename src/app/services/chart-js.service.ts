import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChartJsService {

  constructor() { }

  newChart() {
    return {
      datasets: []
    };
  }
  newDataset(datasetLabel : string, datasetColor : string) : CJDataset {
    const dataset : CJDataset = {
      data : [],
      label : datasetLabel,
      fill: false,
      tension: 1,
      borderColor: datasetColor,
      backgroundColor: 'rgba(255,0,0,0.3)'
    };
    return dataset;
  }
  addPoint(dataset: CJDataset, label: string, y :number) {
    let point : CJPoint = {
      x: label,
      y: y
    }
    dataset.data.push(point);
  }
  addDataset(chart: CJChart, dataset : CJDataset) {
    chart.datasets.push(dataset);
  }
}
export interface CJDataset {
  data: (CJPoint | number | null)[],
  label?: string,
  fill?: boolean | any,
  tension?: number | any,
  borderColor?: string | any,
  backgroundColor?: string | any
}
export interface CJPoint {
  x: number | string,
  y: number
}
export interface CJChart {
  datasets: CJDataset[]
}