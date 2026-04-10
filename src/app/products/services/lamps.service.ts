import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Lamp, LampsResponse } from '@products/interfaces/lamps.interface';
import { Observable, of, tap, map, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.productsApiUrl;


const emptyLamp: Lamp = {
  id: 0,
  name: '',
  image: ''
}

@Injectable({
  providedIn: 'root'
})
export class LampsService {

  private http = inject(HttpClient);
  private lampsCache = new Map<string, LampsResponse>();
  private lampCacheById = new Map<number, Lamp>();

  getLamps():Observable<LampsResponse> {

      const cacheKey = 'all';

      if (this.lampsCache.has( cacheKey )) {
        return of(this.lampsCache.get(cacheKey)!);
      }

      return this.http.get<LampsResponse>(`${apiUrl}/lamps`).pipe(
        tap( response => {
          this.lampsCache.set( cacheKey, response);
        })
      )
  }

  getLampById( id: number): Observable<Lamp>{
    const idNum = Number(id);

    if (idNum === 0) {
      return of(emptyLamp);
    }

    if (this.lampCacheById.has(id)) {
      return of(this.lampCacheById.get(id)!)
    }

    return this.http.get<Lamp>(`${apiUrl}/lamps/id/${id}`).pipe(
      tap( resp => {
        this.lampCacheById.set(id,resp);
      })
    )
  }

  createLamp(lampLike: Partial<Lamp>, imageFileList?: FileList): Observable<Lamp> {
    const currentImage = lampLike.image ?? '';

    return this.uploadImageFile(imageFileList).pipe(
      map(imageName => ({
        ...lampLike,
        imagen: imageName || currentImage
      })),
      switchMap((lampLike) =>
        this.http.post<Lamp>(`${apiUrl}/lamps`, lampLike)
      ),
      tap((lamp) => {
        this.lampsCache.clear();
        this.updateLampCache(lamp);
      })
    );
  }

  updateLamp(id: number, data: Partial<Lamp>, imageFileList?: FileList): Observable<Lamp> {
    const currentImage = data.image ?? '';

    return this.uploadImageFile(imageFileList).pipe(
      map(imageName => ({
        ...data,
        imagen: imageName || currentImage
      })),
      switchMap((updatedLamp) =>
        this.http.patch<Lamp>(`${apiUrl}/lamps/${id}`, updatedLamp)
      ),
      tap((lamp) => this.updateLampCache(lamp))
    );
  }

  uploadImageFile(imageFileList?: FileList): Observable<string> {
    if (!imageFileList || imageFileList.length === 0) {
      return of('');
    }

    const file = imageFileList[0];
    return this.uploadImage(file);
  }

  uploadImage(imageFile: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', imageFile);

    return this.http.post<{ fileName: string }>(`${apiUrl}/files/lamp`, formData).pipe(
      map((resp) => resp.fileName)
    );
  }

  deleteLamp(id: number): Observable<void> {
      return this.http.delete<void>(`${apiUrl}/lamps/${id}`).pipe(
        tap(() => {
          this.removeLampFromCache(id);
          this.lampsCache.clear();
        })
      );
  }

  private removeLampFromCache(id: number) {
    this.lampCacheById.delete(id);

    this.lampsCache.forEach((response, key) => {
      const filteredLamps = response.lamps.filter(lamp => lamp.id !== id);
      this.lampsCache.set(key, {
        ...response,
        lamps: filteredLamps,
      });
    });
  }

  private updateLampCache(lamp: Lamp) {
      this.lampCacheById.set(lamp.id, lamp);

      const lampId = lamp.id;

      this.lampsCache.forEach(lampsResponse => {
        lampsResponse.lamps = lampsResponse.lamps.map(currentLamp =>
          currentLamp.id === lampId ? lamp : currentLamp
        );
      });
  }


}
