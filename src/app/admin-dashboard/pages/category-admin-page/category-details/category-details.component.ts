import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from 'src/app/utils/form-utils';
import { FormErrorLabelComponent } from "@dashboard/components/form-error-label/form-error-label.component";
import { Category } from '@products/interfaces/categories.interface';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CategoriesService } from '@products/services/categories.service';

@Component({
  selector: 'admin-category-details',
  imports: [ReactiveFormsModule, FormErrorLabelComponent],
  templateUrl: './category-details.component.html'
})
export class CategoryDetailsComponent implements OnInit {

  router = inject(Router);
  formUtils = FormUtils;

  category = input.required<Category>();

  fb = inject(FormBuilder);
  categoryService = inject(CategoriesService);

  wasSaved = signal(false);
  successMessage = signal('');
  isLoading = signal(false);

  imageFileList: FileList | undefined = undefined;
  tempImages = signal<string[]>([]);


  categoryForm: FormGroup = this.fb.group({
    slug: ['',[Validators.required, Validators.pattern(FormUtils.slugPattern)]],
    title: ['', Validators.required]
  })


  ngOnInit(): void {
    this.setFormValue(this.category())
  }

  setFormValue(formLike: Partial<Category>) {
    this.categoryForm.reset();

    this.categoryForm.patchValue({
      slug: formLike.slug,
      title: formLike.title,
    });
  }

  async onSubmit() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const formValue = this.categoryForm.value;

    const categoryLike = {
      slug: formValue.slug,
      titulo: formValue.title
    };

    try {
      if (this.category().id === 0) { //nuevo
        const category = await firstValueFrom(
          this.categoryService.createCategory(categoryLike)
        )

        this.successMessage.set('Categoría creada correctamente');
        this.wasSaved.set(true);

        setTimeout(() => {
          this.wasSaved.set(false);
          this.successMessage.set('');
          this.router.navigate(['/admin/category', category.id]);
        }, 1000);

      } else { //actualiza

        await firstValueFrom(
          this.categoryService.updateCategory(this.category().id ,categoryLike)
        )

        this.successMessage.set('Categoría actualizada correctamente');
        this.wasSaved.set(true);

        setTimeout(() => {
          this.wasSaved.set(false);
          this.successMessage.set('');
        }, 3000);

      }
    } catch (err) {
      // manejo de errores aquí
    } finally {
      this.isLoading.set(false);
    }
  }

}
