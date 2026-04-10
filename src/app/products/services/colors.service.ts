import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Color, ColorsResponse } from '@products/interfaces/colors.interface';
import { Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.productsApiUrl;

const emptyColor: Color = {
  id: 0,
  name: '',
  hexa: ''
}

@Injectable({
  providedIn: 'root'
})
export class ColorsService {

  private http = inject(HttpClient);
  private colorsCache = new Map<string, ColorsResponse>();
  private colorCacheById = new Map<number, Color>();

  getColors( ):Observable<ColorsResponse> {
      const cacheKey = 'all';

      if (this.colorsCache.has( cacheKey )) {
        return of(this.colorsCache.get(cacheKey)!);
      }

      return this.http.get<ColorsResponse>(`${apiUrl}/colors`).pipe(
        tap( response => {
          this.colorsCache.set( cacheKey, response);
        })
      )
  }


  getColorById( id: number): Observable<Color>{
    const idNum = Number(id);

    if (idNum === 0) {
      return of(emptyColor);
    }

    if (this.colorCacheById.has(id)) {
      return of(this.colorCacheById.get(id)!)
    }

    return this.http.get<Color>(`${apiUrl}/colors/id/${id}`).pipe(
      tap( resp => {
        this.colorCacheById.set(id,resp);
      })
    )
  }

  createColor(colorLike: Partial<Color>): Observable<Color> {
    return this.http.post<Color>(`${apiUrl}/colors`, colorLike).pipe(
      tap((color) => {
        this.colorsCache.clear();
        this.updateColorCache(color);
      })
    );
  }

  updateColor(id: number, data: Partial<Color>): Observable<Color> {
    return this.http.patch<Color>(`${apiUrl}/colors/${id}`, data).pipe(
      tap((color) => this.updateColorCache(color))
    );
  }

  deleteColor(id: number): Observable<void> {
      return this.http.delete<void>(`${apiUrl}/colors/${id}`).pipe(
        tap(() => {
          this.removeColorFromCache(id);
          this.colorsCache.clear();
        })
      );
  }

  private removeColorFromCache(id: number) {
    this.colorCacheById.delete(id);

    this.colorsCache.forEach((response, key) => {
      const filteredColors = response.colors.filter(color => color.id !== id);
      this.colorsCache.set(key, {
        ...response,
        colors: filteredColors,
      });
    });
  }

  private updateColorCache(color: Color) {
      this.colorCacheById.set(color.id, color);

      const colorId = color.id;

      this.colorsCache.forEach(colorsResponse => {
        colorsResponse.colors = colorsResponse.colors.map(currentColor =>
          currentColor.id === colorId ? color : currentColor
        );
      });
  }

}
