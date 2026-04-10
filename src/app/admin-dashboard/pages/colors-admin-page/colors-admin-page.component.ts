import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ColorsService } from '@products/services/colors.service';
import { ColorTableComponent } from "@dashboard/components/color-table/color-table.component";

@Component({
  selector: 'app-colors-admin-page',
  imports: [RouterLink, ColorTableComponent],
  templateUrl: './colors-admin-page.component.html'
})
export class ColorsAdminPageComponent {

  colorsService = inject(ColorsService);
  refreshSignal = signal(0);

  colorResource = rxResource({
    request: () => ({ refresh: this.refreshSignal() }),
    loader: () => this.colorsService.getColors()
  });

  onDeleteColor(id: number) {
    this.colorsService.deleteColor(id).subscribe({
      next: () => {
        // Recargar después de borrar
        this.refreshSignal.update(n => n + 1);
      },
      error: (err) => {
        console.error('Error eliminando evento:', err);
      }
    });
  }

}
