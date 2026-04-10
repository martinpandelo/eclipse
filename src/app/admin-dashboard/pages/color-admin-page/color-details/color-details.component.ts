import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormErrorLabelComponent } from '@dashboard/components/form-error-label/form-error-label.component';
import { Color } from '@products/interfaces/colors.interface';
import { ColorsService } from '@products/services/colors.service';
import { firstValueFrom } from 'rxjs';
import { FormUtils } from 'src/app/utils/form-utils';

@Component({
  selector: 'admin-color-details',
  imports: [ReactiveFormsModule, FormErrorLabelComponent],
  templateUrl: './color-details.component.html'
})
export class ColorDetailsComponent implements OnInit {

  router = inject(Router);
  formUtils = FormUtils;

  color = input.required<Color>();

  fb = inject(FormBuilder);
  colorService = inject(ColorsService);

  wasSaved = signal(false);
  successMessage = signal('');
  isLoading = signal(false);

  imageFileList: FileList | undefined = undefined;
  tempImages = signal<string[]>([]);


  colorForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    hexa: ['', Validators.required]
  })


  ngOnInit(): void {
    this.setFormValue(this.color())
  }

  setFormValue(formLike: Partial<Color>) {
    this.colorForm.reset();

    this.colorForm.patchValue({
      name: formLike.name,
      hexa: formLike.hexa,
    });
  }

  async onSubmit() {
    if (this.colorForm.invalid) {
      this.colorForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const formValue = this.colorForm.value;

    const colorLike = {
      nombre: formValue.name,
      hexa: formValue.hexa
    };

    try {
      if (this.color().id === 0) { //nuevo
        const color = await firstValueFrom(
          this.colorService.createColor(colorLike)
        )

        this.successMessage.set('Color creado correctamente');
        this.wasSaved.set(true);

        setTimeout(() => {
          this.wasSaved.set(false);
          this.successMessage.set('');
          this.router.navigate(['/admin/color', color.id]);
        }, 1000);

      } else { //actualiza

        await firstValueFrom(
          this.colorService.updateColor(this.color().id ,colorLike)
        )

        this.successMessage.set('Color actualizado correctamente');
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
