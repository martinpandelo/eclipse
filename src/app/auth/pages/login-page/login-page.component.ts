import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder,FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from 'src/app/utils/form-utils';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styles: `
    .form-signin {
      max-width: 330px;
      padding: 1rem;
    }

    .form-signin .form-floating:focus-within {
      z-index: 2;
    }

    .form-signin input[type="email"] {
      margin-bottom: -1px;
      border-bottom-right-radius: 0;
      border-bottom-left-radius: 0;
    }

    .form-signin input[type="password"] {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
  `
})
export class LoginPageComponent {

  authService = inject(AuthService);
  router = inject(Router);
  fb = inject(FormBuilder);

  formUtils = FormUtils;

  hasError = signal(false);
  isPosting = signal(false);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.pattern( this.formUtils.emailPattern )]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  })

  onSubmit() {
    if (this.loginForm.invalid) {
      this.hasError.set(true);
      this.loginForm.markAllAsTouched();

      setTimeout(() => {
        this.hasError.set(false);
      }, 2000);

      return;
    }

    const { email='', password=''} = this.loginForm.value;

    this.authService.login(email, password).subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigateByUrl('/admin');
        return;
      }

      this.hasError.set(true);
    })
  }

}
