import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from '@website-front/components/footer/footer.component';
import { HeaderHomeComponent } from "@website-front/components/header-home/header-home.component";
import { HeaderBasicComponent } from "@website-front/components/header-basic/header-basic.component";
import { HeaderEclipseComponent } from "@website-front/components/header-eclipse/header-eclipse.component";
import { FooterEclipseComponent } from "@website-front/components/footer-eclipse/footer-eclipse.component";

@Component({
  selector: 'app-layouts',
  imports: [RouterOutlet, FooterComponent, HeaderHomeComponent, HeaderBasicComponent, HeaderEclipseComponent, FooterEclipseComponent],
  templateUrl: './website-front-layouts.component.html'
})
export class WebsiteFrontLayoutsComponent {

  router = inject(Router);
  route = inject(ActivatedRoute);

  isSiteEclipse() {
    return this.router.url.startsWith('/eclipse');
  }

  isHomePage(): boolean {
    const segments = this.router.url.split('/');
    const mainPath = segments[1]; // "ar-servicios-industriales" o "eclipse"
    const subPath = segments[2]; // undefined si es el home
    return !!mainPath && !subPath; // si no hay subruta, es el home del sitio
  }

}
