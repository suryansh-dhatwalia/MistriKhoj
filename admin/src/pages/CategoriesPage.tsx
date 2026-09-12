import React from 'react';
import { Typography } from '@mui/material';
import { categoriesApi } from '../api/content.api';
import type { CategoryItem } from '../types/content.types';
import { ResourcePage } from '../components/resource/ResourcePage';
import { StatusChip } from '../components/resource/StatusChip';
import { statusField, sortOrderField } from '../components/resource/fieldPresets';
import type { ColumnDef, FieldDef } from '../components/resource/resourceConfig';

const columns: ColumnDef<CategoryItem>[] = [
  { key: 'sortOrder', header: '#', width: 60 },
  {
    key: 'name',
    header: 'Category',
    render: (row) => (
      <div>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {row.name}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {row.slug}
        </Typography>
      </div>
    ),
  },
  { key: 'iconName', header: 'Icon', width: 120 },
  {
    key: 'popularServices',
    header: 'Popular services',
    render: (row) => `${row.popularServices.length} listed`,
  },
  { key: 'status', header: 'Status', render: (row) => <StatusChip status={row.status} /> },
];

const fields: FieldDef[] = [
  { type: 'text', name: 'name', label: 'Category name', required: true },
  {
    type: 'text',
    name: 'slug',
    label: 'Slug',
    required: true,
    helperText: 'Lowercase, hyphenated. Used as a stable identifier — avoid changing it later.',
    placeholder: 'ac-appliance-repair',
  },
  { type: 'text', name: 'hindiName', label: 'Hindi / regional name' },
  {
    type: 'text',
    name: 'iconName',
    label: 'Icon name',
    helperText: 'A lucide-react icon name, e.g. Zap, Droplet, Hammer, Wrench.',
  },
  { type: 'textarea', name: 'description', label: 'Description' },
  { type: 'text', name: 'avgResponseTime', label: 'Avg. response time', placeholder: '15-30 mins' },
  { type: 'stringList', name: 'popularServices', label: 'Popular services' },
  sortOrderField,
  statusField,
];

const emptyValues = {
  name: '',
  slug: '',
  hindiName: '',
  iconName: '',
  description: '',
  avgResponseTime: '',
  popularServices: [] as string[],
  sortOrder: 0,
  status: 'ACTIVE',
};

export const CategoriesPage: React.FC = () => (
  <ResourcePage<CategoryItem>
    title="Categories"
    subtitle="Trade categories shown on the homepage, directory filters and registration form."
    api={categoriesApi}
    singularLabel="Category"
    columns={columns}
    fields={fields}
    sortableKeys={['sortOrder', 'name', 'slug']}
    defaultSortBy="sortOrder"
    searchPlaceholder="Search by name or slug"
    emptyFormValues={emptyValues}
    rowLabel={(row) => row.name}
    toFormValues={(row) => ({
      name: row.name,
      slug: row.slug,
      hindiName: row.hindiName ?? '',
      iconName: row.iconName ?? '',
      description: row.description ?? '',
      avgResponseTime: row.avgResponseTime ?? '',
      popularServices: row.popularServices ?? [],
      sortOrder: row.sortOrder,
      status: row.status,
    })}
  />
);
