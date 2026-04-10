import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Lamp } from '@products/interfaces/lamps.interface';
import { pathImagePipe } from "../../../shared/pipes/path-image.pipe";

@Component({
  selector: 'lamp-table',
  imports: [RouterLink, pathImagePipe],
  templateUrl: './lamp-table.component.html'
})
export class LampTableComponent {

  @Input() lamps: Lamp[] = [];

  @Output() delete = new EventEmitter<number>();

  onDeleteLamp(lampId: number) {
    if (confirm('¿Estás seguro que querés eliminar esta lámpara?')) {
      this.delete.emit(lampId);
    }
  }

}
