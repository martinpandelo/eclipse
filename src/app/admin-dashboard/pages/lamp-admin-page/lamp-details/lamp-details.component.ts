import { Component, inject, input, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormErrorLabelComponent } from '@dashboard/components/form-error-label/form-error-label.component';
import { Lamp } from '@products/interfaces/lamps.interface';
import { LampsService } from '@products/services/lamps.service';
import { pathImagePipe } from '@shared/pipes/path-image.pipe';
import { firstValueFrom } from 'rxjs';
import { FormUtils } from 'src/app/utils/form-utils';

@Component({
  selector: 'admin-lamp-details',
  imports: [ReactiveFormsModule, FormErrorLabelComponent, pathImagePipe],
  templateUrl: './lamp-details.component.html'
})
export class LampDetailsComponent implements OnInit {

  router = inject(Router);
  formUtils = FormUtils;

  lamp = input.required<Lamp>();

  fb = inject(FormBuilder);
  lampService = inject(LampsService);

  wasSaved = signal(false);
  successMessage = signal('');
  isLoading = signal(false);

  imageFileList: FileList | undefined = undefined;
  tempImages = signal<string[]>([]);


  lampForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    image: [null]
  })


  ngOnInit(): void {
    this.setFormValue(this.lamp())
  }

  setFormValue(formLike: Partial<Lamp>) {
    this.lampForm.reset();

    this.lampForm.patchValue({
      name: formLike.name,
      image: formLike.image || null
    });
  }

  async onSubmit() {
    if (this.lampForm.invalid) {
      this.lampForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const formValue = this.lampForm.value;

    const imageName = formValue.image
    ? formValue.image.split('/').pop() || ''
    : '';

    const lampLike = {
      nombre: formValue.name,
      image: imageName
    };

    try {
      if (this.lamp().id === 0) { //nuevo
        const lamp = await firstValueFrom(
          this.lampService.createLamp(lampLike, this.imageFileList)
        )

        this.successMessage.set('Lámpara creada correctamente');
        this.wasSaved.set(true);

        setTimeout(() => {
          this.wasSaved.set(false);
          this.successMessage.set('');
          this.router.navigate(['/admin/lamp', lamp.id]);
        }, 1000);

      } else { //actualiza

        await firstValueFrom(
          this.lampService.updateLamp(this.lamp().id ,lampLike, this.imageFileList)
        )

        this.successMessage.set('Lámpara actualizada correctamente');
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

  //image
  onFilesChanged(event: Event) {
    const fileList = (event.target as HTMLInputElement).files;
    this.imageFileList = fileList ?? undefined;

    if (fileList && fileList.length > 0) {
      const previewUrl = URL.createObjectURL(fileList[0]);
      this.lampForm.patchValue({ image: previewUrl });
    }
  }

  removeImage() {
    this.lampForm.patchValue({ image: null });
    this.imageFileList = undefined;
  }

}
