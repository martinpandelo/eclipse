import { Component, effect, inject } from '@angular/core';
import { toSignal, rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { LampsService } from '@products/services/lamps.service';
import { map } from 'rxjs';
import { LampDetailsComponent } from "./lamp-details/lamp-details.component";

@Component({
  selector: 'app-lamp-admin-page',
  imports: [LampDetailsComponent],
  templateUrl: './lamp-admin-page.component.html'
})
export class LampAdminPageComponent {

  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  lampService = inject(LampsService);

    lampId = toSignal(
      this.activatedRoute.params.pipe(
        map((params)=> params['id'])
      )
    );

    lampResource = rxResource({
      request: () => ({
        id: this.lampId()
      }),
      loader: ({ request }) => {
        return this.lampService.getLampById( request.id );
      }
    });

    redirectEffect = effect(() => {
      if (this.lampResource.error()) {
        this.router.navigateByUrl('/admin');
      }
    })

}
