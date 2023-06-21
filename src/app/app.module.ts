import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { HttpCacheInterceptorModule, useHttpCacheLocalStorage } from '@ngneat/cashew';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import * as echarts from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';
import { InvestChartComponent } from './components/invest-chart/invest-chart.component';
import { QuoteChartComponent } from './components/quote-chart/quote-chart.component';
import { SimulationOneComponent } from './components/simulation-one/simulation-one.component';
import { InvestPanelComponent } from './components/invest-panel/invest-panel.component';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt)
@NgModule({
  declarations: [
    AppComponent,
    InvestChartComponent,
    QuoteChartComponent,
    SimulationOneComponent,
    InvestPanelComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    HttpCacheInterceptorModule.forRoot({
      ttl: 60000 * 60 * 24 * 30 * 3
    }),
    BrowserAnimationsModule,
    FlexLayoutModule,
    NgxEchartsModule.forRoot({ echarts }),
  ],
  providers: [useHttpCacheLocalStorage, {provide: LOCALE_ID, useValue: 'pt-BR' }],
  bootstrap: [AppComponent]
})
export class AppModule { }
