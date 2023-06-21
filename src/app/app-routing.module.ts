import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvestChartComponent } from './components/invest-chart/invest-chart.component';
import { QuoteChartComponent } from './components/quote-chart/quote-chart.component';
import { SimulationOneComponent } from './components/simulation-one/simulation-one.component';

const routes: Routes = [
  { path: '', redirectTo: '/simulationOne', pathMatch: 'full' },
  { path: 'invest', component: InvestChartComponent },
  { path: 'quote', component: QuoteChartComponent },
  { path: 'simulationOne', component:SimulationOneComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
