import { Component, effect, inject } from '@angular/core';
import { toSignal, rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ColorsService } from '@products/services/colors.service';
import { map } from 'rxjs';
import { ColorDetailsComponent } from "./color-details/color-details.component";

@Component({
  selector: 'app-color-admin-page',
  imports: [ColorDetailsComponent],
  templateUrl: './color-admin-page.component.html'
})
export class ColorAdminPageComponent {

  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  colorService = inject(ColorsService);

    colorId = toSignal(
      this.activatedRoute.params.pipe(
        map((params)=> params['id'])
      )
    );

    colorResource = rxResource({
      request: () => ({
        id: this.colorId()
      }),
      loader: ({ request }) => {
        return this.colorService.getColorById( request.id );
      }
    });

    redirectEffect = effect(() => {
      if (this.colorResource.error()) {
        this.router.navigateByUrl('/admin');
      }
    })

}
