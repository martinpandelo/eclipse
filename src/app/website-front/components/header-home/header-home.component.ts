import { NgIf } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'front-header-home',
  imports: [RouterLink, NgIf],
  templateUrl: './header-home.component.html'
})
export class HeaderHomeComponent{

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
    this.navbarScrolled = window.scrollY > 500;
  }

  isPlaying = false;

  playVideo() {
    this.isPlaying = true;
  }

}
