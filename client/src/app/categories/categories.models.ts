/**
 * Types partagés avec le contrat d'API (openapi.yaml, section Catégories).
 */

export interface CategoryInput {
  name: string;
  color?: string;
}

export interface Category extends CategoryInput {
  id: string;
}

/**
 * Palette autorisée par le contrat (enum de CategoryInput.color).
 * Si le contrat change, c'est ici qu'il faut mettre à jour la liste.
 */
export const CATEGORY_COLORS = [
  { value: '#EF4444', label: 'Rouge' },
  { value: '#F97316', label: 'Orange' },
  { value: '#EAB308', label: 'Jaune' },
  { value: '#22C55E', label: 'Vert' },
  { value: '#3B82F6', label: 'Bleu' },
  { value: '#8B5CF6', label: 'Violet' },
] as const;

/** Couleur affichée quand une catégorie n'a pas de couleur (champ facultatif). */
export const DEFAULT_CATEGORY_COLOR = '#9CA3AF';
