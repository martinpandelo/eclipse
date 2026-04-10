import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '@products/interfaces/categories.interface';

@Component({
  selector: 'category-table',
  imports: [RouterLink],
  templateUrl: './category-table.component.html'
})
export class CategoryTableComponent {

  @Input() categories: Category[] = [];

  @Output() delete = new EventEmitter<number>();

  onDeleteCategory(categoryId: number) {
    if (confirm('¿Estás seguro que querés eliminar esta categoría?')) {
      this.delete.emit(categoryId);
    }
  }

}
