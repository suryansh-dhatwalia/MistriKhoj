import { categoriesApi, citiesApi, statesApi } from './content.api';
import type { SelectOption } from '../components/resource/resourceConfig';

/** State options keyed by id — for the City form's foreign key. */
export async function loadStateIdOptions(): Promise<SelectOption[]> {
  const response = await statesApi.list({ pageSize: 100, sortBy: 'sortOrder', sortOrder: 'asc' });
  return response.data.map((state) => ({ value: state.id, label: state.name }));
}

/** State options keyed by name — for ad targeting, which stores plain strings. */
export async function loadStateNameOptions(): Promise<SelectOption[]> {
  const response = await statesApi.list({ pageSize: 100, sortBy: 'sortOrder', sortOrder: 'asc' });
  return response.data.map((state) => ({ value: state.name, label: state.name }));
}

export async function loadCityNameOptions(): Promise<SelectOption[]> {
  const response = await citiesApi.list({ pageSize: 500, sortBy: 'name', sortOrder: 'asc' });
  return response.data.map((city) => ({ value: city.name, label: city.name }));
}

export async function loadCategoryNameOptions(): Promise<SelectOption[]> {
  const response = await categoriesApi.list({ pageSize: 200, sortBy: 'name', sortOrder: 'asc' });
  return response.data.map((category) => ({ value: category.name, label: category.name }));
}
