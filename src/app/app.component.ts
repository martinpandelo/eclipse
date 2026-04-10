import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import AOS from 'aos';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  router = inject(Router)

  ngOnInit() {
    AOS.init({
      duration: 1000,
      once: false,
      offset: 50
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        setTimeout(() => {
          AOS.refresh();
        }, 50);
      }
    });
  }

}
