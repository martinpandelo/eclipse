import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NoveltyOrderComponent } from "@dashboard/components/novelty-order/novelty-order.component";
import { ProductsService } from '@products/services/products.service';

@Component({
  selector: 'app-products-order-admin-page',
  imports: [NoveltyOrderComponent],
  templateUrl: './products-order-admin-page.component.html'
})
export class ProductsOrderAdminPageComponent {

    productsService = inject(ProductsService);

    productResource = rxResource({
      request: () => ({
        novedad: true,
        sortBy: 'pd_orden_novedad',
        direction: 'asc' as const
      }),
      loader: ({ request }) => {
        return this.productsService.getProducts({
          novedad: request.novedad,
          sortBy: request.sortBy,
          direction: request.direction
        })
      }
    });

}
