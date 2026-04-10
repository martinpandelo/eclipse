import { Component, computed, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductCardComponent } from '@products/components/product-card/product-card.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { map } from 'rxjs';

import { ProductsService } from '@products/services/products.service';
import { PaginationService } from '@shared/components/pagination/pagination.service';
import { CategoriesService } from '@products/services/categories.service';
import { UpperCasePipe } from '@angular/common';


@Component({
  selector: 'app-products-page',
  imports: [RouterLink, ProductCardComponent, PaginationComponent, UpperCasePipe],
  templateUrl: './products-page.component.html'
})
export class ProductsPageComponent {

  productsService = inject(ProductsService);
  categoriesService = inject(CategoriesService);
  paginationService = inject(PaginationService);

  route = inject(ActivatedRoute);
  router = inject(Router);

  categoria = toSignal(this.route.params.pipe(
    map( ({ categoria }) => categoria )
  ));

  novedadesActivas = computed(() => this.categoria() === 'novedades');

  searchQuery = toSignal(
    this.route.queryParams.pipe(map(params => params['buscar'] || ''))
  );


  productResource = rxResource({
    request: () => ({
      categoria: this.novedadesActivas() ? '' : this.categoria(),
      page: this.paginationService.currentPage() - 1,
      novedad: this.novedadesActivas(),
      search: this.searchQuery(),
      sortBy: this.novedadesActivas() ? 'pd_orden_novedad' : 'pd_id',
      direction: this.novedadesActivas() ? 'asc' as const : 'desc' as const
    }),
    loader: ({ request }) => {
      return this.productsService.getProducts({
        categoria: request.categoria,
        offset: request.page * this.paginationService.productsPerPage,
        limit: this.paginationService.productsPerPage,
        novedad: request.novedad,
        search: request.search,
        sortBy: request.sortBy,
        direction: request.direction
      });
    }
  });

  //categorias
  categoryResource = rxResource({
    request: () => ({ }),
    loader: () => {
      return this.categoriesService.getCategories({ });
    }
  });

  categoriaNombre = computed(() => {
    const slug = this.categoria();

    if (!slug) return null;
    if (slug === 'novedades') return 'Novedades';

    const categorias = this.categoryResource.value()?.categories;
    const match = categorias?.find(cat => cat.slug === slug);
    return match ? match.title : slug;
  });

  categoriaInvalida = computed(() => {
    const slug = this.categoria();

    if (!slug || slug === 'novedades') return false;

    const categorias = this.categoryResource.value()?.categories;
    return !categorias?.some(cat => cat.slug === slug);
  });


}
