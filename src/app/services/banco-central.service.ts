import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { withCache } from '@ngneat/cashew';
import { Observable, throwError, firstValueFrom } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BancoCentralService {
  // https://api.bcb.gov.br/dados/serie/bcdata.sgs.10844/dados?formato=json&dataInicial=02/01/2010&dataFinal=31/12/2016
  urlIpca = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.10844/dados?formato=json&dataInicial={{dataInicial}}&dataFinal={{dataFinal}}';
  URLCdi = "http://ipeadata.gov.br/api/odata4/ValoresSerie(SERCODIGO='BM12_TJCDI12')";
  constructor(private http: HttpClient) { }
  fromUnixTS(ts : number) : string {
    const d = new Date(ts * 1000);
    let datestring = d.getFullYear() + '-' + ("0"+(d.getMonth()+1)).slice(-2) + '-' + ("0" + d.getDate()).slice(-2);
    return datestring;
  }
  toUnixTS(date : Date) : string {
    return ''+Math.floor(date.getTime() / 1000);
  }
  parseDate(str: string) : Date {
    var parts = str.split("/");
    return new Date(parseInt(parts[2], 10),
                      parseInt(parts[1], 10) - 1,
                      parseInt(parts[0], 10));
  }
  convertDate(str: string) : string {
    var parts = str.split("/");
    return parts[2] + '-' + parts[1] + '-' + parts[0];
  }
  async getIPCA(year: number) : Promise<Map<string, number>> {
    let ipca : _BcbIpca[] = await firstValueFrom(this.http.get<_BcbIpca[]>(this.urlIpca, {context: withCache()}));
    let posS = 0;
    const start = new Date(year + '-01-01');
    const end = new Date(year + '-12-31');
    while (start > this.parseDate(ipca[posS].data) && posS < ipca.length) posS ++;
    let posE = posS;
    while (posE < ipca.length && ipca[posE] && end > this.parseDate(ipca[posE].data)) posE ++;
    let slice = ipca.slice(posS, posE);
    let map = new Map<string, number>();
    slice.forEach(item => {
      map.set(this.convertDate(item.data), Number(item.valor));
    });
    return map;
  }
  async getCDI(start : Date, end : Date, force: boolean) : Promise<Map<string, number>> {
    let cdi !:_Odata;
    if (force) {
      cdi = await firstValueFrom (
        this.http.get<_Odata>(this.URLCdi)
      );
    } else {
      cdi = await firstValueFrom(
        this.http.get<_Odata>(this.URLCdi, {context: withCache()})
      );
    }
    const acdi = cdi.value;
    let posS = 0;
    while (start >= new Date(acdi[posS].VALDATA) && posS < acdi.length) posS ++;
    let posE = posS;
    while (acdi[posE] && end > new Date(acdi[posE].VALDATA) && posE < acdi.length) posE ++;
    let slice = acdi.slice(posS, posE);
    let map = new Map<string, number>();
    slice.forEach(item => {
      map.set(item.VALDATA.split('T')[0], item.VALVALOR);
    });
    return map;
  }
}
interface _Odata{
  "@odata.context": string,
  "value" : IpeaValorSerie[]
}
export interface IpeaValorSerie {
  "SERCODIGO": string,
  "VALDATA": string,
  "VALVALOR":number,
  "NIVNOME": string,
  "TERCODIGO":string
}
export interface BcbIpca {
  data: string,
  valor: number
}
interface _BcbIpca {
  data: string,
  valor: string
}
