import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Color } from '@products/interfaces/colors.interface';

@Component({
  selector: 'color-table',
  imports: [RouterLink],
  templateUrl: './color-table.component.html'
})
export class ColorTableComponent {

  @Input() colors: Color[] = [];

  @Output() delete = new EventEmitter<number>();

  onDeleteColor(colorId: number) {
    if (confirm('¿Estás seguro que querés eliminar este color?')) {
      this.delete.emit(colorId);
    }
  }

}
