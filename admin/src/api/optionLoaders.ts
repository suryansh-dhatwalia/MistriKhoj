import { categoriesApi, citiesApi, statesApi } from './content.api';
import type { SelectOption } from '../components/resource/resourceConfig';

/** The backend caps list pages at 100 rows, so walk every page to build a complete option list. */
const MAX_PAGE_SIZE = 100;

type Lister<T> = (params: Record<string, unknown>) => Promise<{ data: T[]; totalPages?: number }>;

async function listAll<T>(list: Lister<T>, params: Record<string, unknown>): Promise<T[]> {
  const rows: T[] = [];
  for (let page = 1; ; page += 1) {
    const response = await list({ ...params, page, pageSize: MAX_PAGE_SIZE });
    rows.push(...response.data);
    if (response.data.length < MAX_PAGE_SIZE || page >= (response.totalPages ?? page)) return rows;
  }
}

/** State options keyed by id — for the City form's foreign key. */
export async function loadStateIdOptions(): Promise<SelectOption[]> {
  const states = await listAll(statesApi.list, { sortBy: 'sortOrder', sortOrder: 'asc' });
  return states.map((state) => ({ value: state.id, label: state.name }));
}

/** State options keyed by name — for ad targeting, which stores plain strings. */
export async function loadStateNameOptions(): Promise<SelectOption[]> {
  const states = await listAll(statesApi.list, { sortBy: 'sortOrder', sortOrder: 'asc' });
  return states.map((state) => ({ value: state.name, label: state.name }));
}

export async function loadCityNameOptions(): Promise<SelectOption[]> {
  const cities = await listAll(citiesApi.list, { sortBy: 'name', sortOrder: 'asc' });
  return cities.map((city) => ({ value: city.name, label: city.name }));
}

export async function loadCategoryNameOptions(): Promise<SelectOption[]> {
  const categories = await listAll(categoriesApi.list, { sortBy: 'name', sortOrder: 'asc' });
  return categories.map((category) => ({ value: category.name, label: category.name }));
}
