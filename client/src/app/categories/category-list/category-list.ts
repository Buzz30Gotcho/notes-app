import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ApiError } from '../../auth/auth.models';
import { CATEGORY_COLORS, Category, CategoryInput, DEFAULT_CATEGORY_COLOR } from '../categories.models';
import { CategoriesService } from '../categories.service';

/**
 * US03 — Catégoriser mes notes par thèmes.
 * Affiche les catégories de l'utilisateur (GET /categories) et permet d'en créer
 * une nouvelle avec une couleur de la palette du contrat (POST /categories).
 */
@Component({
  selector: 'app-category-list',
  imports: [ReactiveFormsModule],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css',
})
export class CategoryList implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly categoriesService = inject(CategoriesService);

  protected readonly colors = CATEGORY_COLORS;
  protected readonly defaultColor = DEFAULT_CATEGORY_COLOR;

  protected readonly categories = signal<Category[]>([]);
  protected readonly loadError = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly saving = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    // Validators.pattern(/\S/) refuse un nom composé uniquement d'espaces.
    name: ['', [Validators.required, Validators.pattern(/\S/)]],
    color: [''],
  });

  ngOnInit(): void {
    this.categoriesService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => this.loadError.set('Impossible de charger vos catégories.'),
    });
  }

  /** Clic sur une pastille : la sélectionne, ou la désélectionne si elle l'était déjà. */
  protected selectColor(value: string): void {
    const current = this.form.controls.color.value;
    this.form.controls.color.setValue(current === value ? '' : value);
  }

  protected submit(): void {
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, color } = this.form.getRawValue();
    // color est facultatif dans le contrat : on ne l'envoie que s'il est choisi.
    const input: CategoryInput = color ? { name: name.trim(), color } : { name: name.trim() };

    this.saving.set(true);
    this.categoriesService.createCategory(input).subscribe({
      next: (created) => {
        this.saving.set(false);
        this.categories.update((list) => [...list, created]);
        this.form.reset();
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        const apiError = err.error as ApiError | null;
        this.errorMessage.set(
          err.status === 400
            ? (apiError?.message ?? 'Les données envoyées sont invalides.')
            : 'Une erreur est survenue. Réessayez plus tard.',
        );
      },
    });
  }
}
