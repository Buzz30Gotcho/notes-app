import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../api.config';
import { CategoryList } from './category-list';

describe('CategoryList (US03 - Catégoriser mes notes)', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryList],
      // Le faux serveur : aucune requête ne part vers le vrai back.
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should display the categories returned by GET /categories', () => {
    const fixture = TestBed.createComponent(CategoryList);
    fixture.detectChanges(); // ouvre l'écran → envoie le GET

    const req = httpMock.expectOne(`${API_BASE_URL}/categories`);
    expect(req.request.method).toBe('GET');
    req.flush([
      { id: '1', name: 'Sport', color: '#3B82F6' },
      { id: '2', name: 'Travail' },
    ]);
    fixture.detectChanges(); // met à jour le HTML

    expect(fixture.nativeElement.textContent).toContain('Sport');
    expect(fixture.nativeElement.textContent).toContain('Travail');
  });

  it('should display a message when there is no category', () => {
    const fixture = TestBed.createComponent(CategoryList);
    fixture.detectChanges();

    httpMock.expectOne(`${API_BASE_URL}/categories`).flush([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Aucune catégorie pour le moment.');
  });

  it('should propose the 6 colors of the contract', () => {
    const fixture = TestBed.createComponent(CategoryList);
    fixture.detectChanges();
    httpMock.expectOne(`${API_BASE_URL}/categories`).flush([]);
    fixture.detectChanges();

    const colorButtons = fixture.nativeElement.querySelectorAll('.color-option');
    expect(colorButtons.length).toBe(6);
  });

  it('should POST a new category and add it to the list', () => {
    const fixture = TestBed.createComponent(CategoryList);
    const component = fixture.componentInstance as any; // accès à form et submit (protected)
    fixture.detectChanges();
    httpMock.expectOne(`${API_BASE_URL}/categories`).flush([]);

    component.form.setValue({ name: 'Lecture', color: '#22C55E' });
    component.submit();

    const req = httpMock.expectOne(`${API_BASE_URL}/categories`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Lecture', color: '#22C55E' });
    req.flush({ id: '3', name: 'Lecture', color: '#22C55E' }, { status: 201, statusText: 'Created' });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Lecture');
  });

  it('should not call the API when the name is empty', () => {
    const fixture = TestBed.createComponent(CategoryList);
    const component = fixture.componentInstance as any;
    fixture.detectChanges();
    httpMock.expectOne(`${API_BASE_URL}/categories`).flush([]);

    component.form.setValue({ name: '', color: '' });
    component.submit();

    httpMock.expectNone(`${API_BASE_URL}/categories`);
  });
});
