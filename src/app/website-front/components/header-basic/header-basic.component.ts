import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SearchFormComponent } from "../search-form/search-form.component";

@Component({
  selector: 'front-header-basic',
  imports: [RouterLink, SearchFormComponent],
  templateUrl: './header-basic.component.html'
})
export class HeaderBasicComponent {

    menuActive = false;
    navbarScrolled = false;

    toggleMenu() {
      this.menuActive = !this.menuActive;
    }

    closeMenu() {
      this.menuActive = false;
    }

    @HostListener('window:scroll', [])
    onWindowScroll() {
      this.navbarScrolled = window.scrollY > 50;
    }

}
