import { Component, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ProductsService } from '@products/services/products.service';
import { catchError, map, throwError } from 'rxjs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RelatedProductsComponent } from '@products/components/related-products/related-products.component';
import { NotFoundPageComponent } from '../not-found-page/not-found-page.component';
import { ImageCarouselComponent } from '@shared/components/image-carousel/image-carousel.component';
import { CategoriesService } from '@products/services/categories.service';
import { pathImagePipe } from "../../../shared/pipes/path-image.pipe";
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-product-sheet',
  imports: [RouterLink, RelatedProductsComponent, NotFoundPageComponent, ImageCarouselComponent, pathImagePipe, UpperCasePipe],
  templateUrl: './product-sheet.component.html'
})
export class ProductSheetComponent  {

  productService = inject(ProductsService);
  categoriesService = inject(CategoriesService);

  route = inject(ActivatedRoute);

  productSlug = toSignal(this.route.params.pipe(
    map( ({ idSlug }) => idSlug )
  ));

  productResource = rxResource({
    request: () => ({ idSlug: this.productSlug() }),
    loader: ({ request }) => {
      return this.productService.getProductBySlug( request.idSlug ).pipe(
      catchError((error) => {
      return throwError(() => error);
      })
    );
    }
  });

  hasAttributes(): boolean | undefined {
    return this.productResource.value()?.variants?.some(v => v.attributes && v.attributes.length > 0);
  }

  hasGraphics(): boolean {
    const variants = this.productResource.value()?.variants ?? [];
    return variants.some(v => !!v.grafic);
  }


  attributeNames(): string[] {
    const variants = this.productResource.value()?.variants || [];
    const names = new Set<string>();

    for (const v of variants) {
      for (const attr of v.attributes) {
        names.add(attr.name);
      }
    }
    return Array.from(names);
  }

  getAttributeValue(variant: any, name: string): string {
    const attr = variant.attributes.find((a: any) => a.name === name);
    return attr ? attr.value : '-';
  }

}
