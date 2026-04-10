import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';

const baseUrl = environment.productsApiUrl;

@Pipe({
  name: 'pathImage'
})
export class pathImagePipe implements PipeTransform {

  transform(
    value: string | { name: string; code: string } | (string | { name: string; code: string })[],
    tipo: 'productos' | 'slides' | 'graficos' | 'lamparas' = 'productos'
  ): string {

    // Normalizar: si es array, me quedo con el primero
    const item = Array.isArray(value) ? value?.[0] : value;

    // Si es objeto, saco el "name"
    const image = typeof item === 'string' ? item : item?.name;

    if (!image || image === 'no-image.jpg') {
      return '/assets/img/no-image.jpg';
    }

    if (image.startsWith('http') || image.startsWith('blob:')) {
      return image;
    }

    return `${baseUrl}/files/${tipo}/${image}`;
  }


}
