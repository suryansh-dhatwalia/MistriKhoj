import type { FieldDef } from './resourceConfig';

export const statusField: FieldDef = {
  type: 'select',
  name: 'status',
  label: 'Status',
  required: true,
  options: [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
  ],
};

export const sortOrderField: FieldDef = {
  type: 'number',
  name: 'sortOrder',
  label: 'Sort order',
  min: 0,
  helperText: 'Lower numbers appear first on the public site.',
};
