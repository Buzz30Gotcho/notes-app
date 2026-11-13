import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ApiError } from '../auth.models';
import { AuthService } from '../auth.service';

/**
 * Formulaire d'inscription. Appelle POST /auth/register et affiche le résultat
 * (succès, 400 données invalides, 409 e-mail déjà utilisé).
 */
@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected submit(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.authService.register(this.form.getRawValue()).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.successMessage.set(`Compte créé pour ${response.user.email}.`);
        this.form.reset();
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const apiError = err.error as ApiError | null;

        if (err.status === 409) {
          this.errorMessage.set(apiError?.message ?? 'Cette adresse e-mail est déjà utilisée.');
        } else if (err.status === 400) {
          this.errorMessage.set(apiError?.message ?? 'Les données envoyées sont invalides.');
        } else {
          this.errorMessage.set('Une erreur est survenue. Réessayez plus tard.');
        }
      },
    });
  }
}
