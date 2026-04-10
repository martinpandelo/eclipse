import { CommonModule } from '@angular/common';
import { Component, effect, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

declare const bootstrap: any;

@Component({
  selector: 'search-form',
  imports: [FormsModule, CommonModule],
  templateUrl: './search-form.component.html'
})
export class SearchFormComponent {

  router = inject(Router);
  searchInput = signal('');
  debounceTime = signal(3000);

  searchTerm = output<string>();
  debouncedSearch = signal('');

  private closeModalIfExists() {
    const modalEl = document.getElementById('searchModal');
    if (modalEl && modalEl.classList.contains('show')) {
      // Cierra el modal usando la API de Bootstrap
      const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modalInstance.hide();
    }
  }

  debounceEffect = effect((onCleanup) => {
    const value = this.searchInput().trim();

    if (!value) return;

    const timeout = setTimeout(() => {
      this.debouncedSearch.set(value);
      this.searchTerm.emit(value);
    }, this.debounceTime());

    onCleanup(() => clearTimeout(timeout));
  });

  navigateEffect = effect(() => {
    const term = this.debouncedSearch();
    if (term) {
      this.closeModalIfExists();
      this.router.navigate(['/ar-servicios-industriales/productos'], {
        queryParams: { buscar: term }
      });
    }
  });

  onSearchEnter() {
    const value = this.searchInput().trim();
    if (!value) return;

    this.closeModalIfExists();
    this.debouncedSearch.set('');
    this.router.navigate(['/ar-servicios-industriales/productos'], {
      queryParams: { buscar: value }
    });

  }

}
