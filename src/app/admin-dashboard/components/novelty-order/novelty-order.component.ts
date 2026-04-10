import { Component, effect, inject, input, signal } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ProductsService } from '@products/services/products.service';
import { Product } from '@products/interfaces/products.interface';
import { pathImagePipe } from "../../../shared/pipes/path-image.pipe";

@Component({
  selector: 'novelty-order',
  imports: [DragDropModule, ScrollingModule, pathImagePipe],
  templateUrl: './novelty-order.component.html'
})
export class NoveltyOrderComponent {

    productsService = inject(ProductsService);

    productsInput = input.required<Product[]>();

    products = signal<Product[]>([]);
    wasSaved = signal(false);

    constructor() {
      effect(() => {
        this.products.set([...this.productsInput()]);
      });
    }

    drop(event: CdkDragDrop<Product[]>) {
      const updated = [...this.products()];
      moveItemInArray(updated, event.previousIndex, event.currentIndex);

      // Actualiza el orden temporalmente en el front
      updated.forEach((prod, index) => {
        prod.order_novelty = index + 1;
      });

      this.products.set(updated);
    }

    saveOrder() {
      const orders = this.products().map(prod => ({
        id: prod.id,
        order: prod.order_novelty ?? 0
      }));

      this.productsService.updateNoveltyOrder(orders).subscribe(() => {
        this.wasSaved.set(true);

        setTimeout(() => this.wasSaved.set(false), 3000);
      });
    }

}
