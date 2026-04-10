import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LampsService } from '@products/services/lamps.service';
import { LampTableComponent } from "@dashboard/components/lamp-table/lamp-table.component";

@Component({
  selector: 'app-lamps-admin-page',
  imports: [RouterLink, LampTableComponent],
  templateUrl: './lamps-admin-page.component.html'
})
export class LampsAdminPageComponent {

  lampsService = inject(LampsService);
  refreshSignal = signal(0);

  lampResource = rxResource({
    request: () => ({ refresh: this.refreshSignal() }),
    loader: () => this.lampsService.getLamps()
  });

  onDeleteLamp(id: number) {
    this.lampsService.deleteLamp(id).subscribe({
      next: () => {
        // Recargar después de borrar
        this.refreshSignal.update(n => n + 1);
      },
      error: (err) => {
        console.error('Error eliminando lámpara:', err);
      }
    });
  }

}
