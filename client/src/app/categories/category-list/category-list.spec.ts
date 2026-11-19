import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../api.config';
import { CATEGORY_COLORS, Category } from '../categories.models';
import { CategoryList } from './category-list';

// ─── Données de test, conformes au contrat (openapi.yaml) ───
const CATEGORIES_URL = `${API_BASE_URL}/categories`;

const EXISTING: Category[] = [
  { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Sport', color: '#3B82F6' },
  { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Travail' }, // sans couleur
];

describe('CategoryList', () => {
  let httpMock: HttpTestingController;
  let fixture: ComponentFixture<CategoryList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryList],
      // Le mock : aucune requête ne part vers le vrai back.
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CategoryList);
    fixture.detectChanges(); // déclenche ngOnInit → GET /categories
  });

  afterEach(() => httpMock.verify());

  // ─── Utilitaires ───

  /** Le faux serveur répond au GET /categories lancé à l'ouverture de l'écran. */
  function respondToLoad(categories: Category[] = EXISTING): void {
    const req = httpMock.expectOne(CATEGORIES_URL);
    expect(req.request.method).toBe('GET');
    req.flush(categories);
    fixture.detectChanges();
  }

  function query<T extends Element = HTMLElement>(selector: string): T | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function queryAll<T extends Element = HTMLElement>(selector: string): T[] {
    return Array.from(fixture.nativeElement.querySelectorAll(selector));
  }

  /** Simule l'utilisateur qui tape un nom, clique éventuellement une pastille puis valide. */
  function fillAndSubmit(name: string, colorLabel?: string): void {
    const input = query<HTMLInputElement>('input[formControlName="name"]')!;
    input.value = name;
    input.dispatchEvent(new Event('input'));

    if (colorLabel) {
      query<HTMLButtonElement>(`button[aria-label="${colorLabel}"]`)!.click();
    }

    query<HTMLButtonElement>('button[type="submit"]')!.click();
    fixture.detectChanges();
  }

  describe('US03 - Catégoriser mes notes', () => {
    // ── C1 : je vois la liste de mes catégories ──
    describe('C1 - afficher mes catégories', () => {
      it('should load the categories with GET /categories and display their names', () => {
        respondToLoad();

        const names = queryAll('.category-name').map((el) => el.textContent?.trim());
        expect(names).toEqual(['Sport', 'Travail']);
      });

      it('should display each category with its color', () => {
        respondToLoad();

        const swatches = queryAll('.swatch');
        // Le navigateur convertit le hexadécimal en rgb() : #3B82F6 = rgb(59, 130, 246)
        expect(swatches[0].style.backgroundColor).toBe('rgb(59, 130, 246)');
      });

      it('should use a default grey when a category has no color', () => {
        respondToLoad();

        const swatches = queryAll('.swatch');
        // DEFAULT_CATEGORY_COLOR #9CA3AF = rgb(156, 163, 175)
        expect(swatches[1].style.backgroundColor).toBe('rgb(156, 163, 175)');
      });

      it('should display a message when there is no category yet', () => {
        respondToLoad([]);

        expect(query('.empty')?.textContent?.trim()).toBe('Aucune catégorie pour le moment.');
        expect(queryAll('.category')).toHaveLength(0);
      });

      it('should display an error when the categories cannot be loaded', () => {
        httpMock
          .expectOne(CATEGORIES_URL)
          .flush({ message: 'Jeton manquant, invalide ou expiré' }, { status: 401, statusText: 'Unauthorized' });
        fixture.detectChanges();

        expect(query('.load-error')?.textContent?.trim()).toBe('Impossible de charger vos catégories.');
      });
    });

    // ── C2 : je peux créer une catégorie ──
    describe('C2 - créer une catégorie', () => {
      it('should propose exactly the 6 colors of the contract', () => {
        respondToLoad();

        const labels = queryAll('.color-option').map((el) => el.getAttribute('aria-label'));
        expect(labels).toEqual(CATEGORY_COLORS.map((c) => c.label));
      });

      it('should POST the name and the selected color, then add the category to the list', () => {
        respondToLoad();

        fillAndSubmit('Lecture', 'Vert');

        const req = httpMock.expectOne(CATEGORIES_URL);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ name: 'Lecture', color: '#22C55E' });
        req.flush(
          { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Lecture', color: '#22C55E' },
          { status: 201, statusText: 'Created' },
        );
        fixture.detectChanges();

        const names = queryAll('.category-name').map((el) => el.textContent?.trim());
        expect(names).toEqual(['Sport', 'Travail', 'Lecture']);
      });

      it('should not send a color when none is selected (color is optional)', () => {
        respondToLoad();

        fillAndSubmit('Voyage');

        const req = httpMock.expectOne(CATEGORIES_URL);
        expect(req.request.body).toEqual({ name: 'Voyage' });
        req.flush({ id: '550e8400-e29b-41d4-a716-446655440004', name: 'Voyage' }, { status: 201, statusText: 'Created' });
      });

      it('should unselect a color when its swatch is clicked twice', () => {
        respondToLoad();
        const blue = query<HTMLButtonElement>('button[aria-label="Bleu"]')!;

        blue.click();
        fixture.detectChanges();
        expect(blue.classList).toContain('selected');

        blue.click();
        fixture.detectChanges();
        expect(blue.classList).not.toContain('selected');
      });

      it('should reset the form after a successful creation', () => {
        respondToLoad();

        fillAndSubmit('Lecture', 'Vert');
        httpMock
          .expectOne(CATEGORIES_URL)
          .flush({ id: '550e8400-e29b-41d4-a716-446655440003', name: 'Lecture', color: '#22C55E' }, { status: 201, statusText: 'Created' });
        fixture.detectChanges();

        expect(query<HTMLInputElement>('input[formControlName="name"]')!.value).toBe('');
        expect(queryAll('.color-option.selected')).toHaveLength(0);
      });
    });

    // ── C3 : une catégorie sans nom est refusée ──
    describe('C3 - refuser une catégorie invalide', () => {
      it('should not call the API when the name is empty', () => {
        respondToLoad();

        fillAndSubmit('');

        httpMock.expectNone(CATEGORIES_URL);
      });

      it('should not call the API when the name contains only spaces', () => {
        respondToLoad();

        fillAndSubmit('   ');

        httpMock.expectNone(CATEGORIES_URL);
      });

      it('should display the API message on 400', () => {
        respondToLoad();

        fillAndSubmit('Sport');
        httpMock
          .expectOne(CATEGORIES_URL)
          .flush({ message: 'Les données envoyées sont invalides.' }, { status: 400, statusText: 'Bad Request' });
        fixture.detectChanges();

        expect(query('.form-error')?.textContent?.trim()).toBe('Les données envoyées sont invalides.');
        // La liste n'a pas changé
        expect(queryAll('.category')).toHaveLength(2);
      });
    });
  });
});
