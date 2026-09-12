import React from 'react';
import { Box } from '@mui/material';
import { advertisementsApi } from '../api/content.api';
import { loadCategoryNameOptions, loadCityNameOptions, loadStateNameOptions } from '../api/optionLoaders';
import type { AdvertisementItem } from '../types/content.types';
import { ResourcePage } from '../components/resource/ResourcePage';
import { StatusChip } from '../components/resource/StatusChip';
import { statusField, sortOrderField } from '../components/resource/fieldPresets';
import type { ColumnDef, FieldDef } from '../components/resource/resourceConfig';

const columns: ColumnDef<AdvertisementItem>[] = [
  { key: 'sortOrder', header: '#', width: 60 },
  { key: 'state', header: 'State', render: (row) => row.state || 'All' },
  { key: 'city', header: 'City', render: (row) => row.city || 'All' },
  { key: 'category', header: 'Category', render: (row) => row.category || 'All' },
  {
    key: 'imageUrl',
    header: 'Banner',
    render: (row) =>
      row.imageUrl ? (
        <Box
          component="img"
          src={row.imageUrl}
          alt={row.title ?? ''}
          sx={{ width: 88, height: 40, objectFit: 'cover', borderRadius: 1, border: '1px solid #E5E7EB' }}
        />
      ) : (
        '—'
      ),
  },
  { key: 'status', header: 'Status', render: (row) => <StatusChip status={row.status} /> },
];

const fields: FieldDef[] = [
  { type: 'text', name: 'title', label: 'Internal title', required: true },
  { type: 'asyncSelect', name: 'state', label: 'Target state', loadOptions: loadStateNameOptions, allowEmpty: true, helperText: 'Leave blank to show in every state.' },
  { type: 'asyncSelect', name: 'city', label: 'Target city', loadOptions: loadCityNameOptions, allowEmpty: true },
  { type: 'asyncSelect', name: 'category', label: 'Target category', loadOptions: loadCategoryNameOptions, allowEmpty: true },
  { type: 'text', name: 'linkUrl', label: 'Click-through link (URL)', placeholder: 'https://…' },
  { type: 'image', name: 'image', label: 'Ad image', required: true },
  sortOrderField,
  statusField,
];

const emptyValues = {
  title: '',
  state: '',
  city: '',
  category: '',
  linkUrl: '',
  image: '',
  sortOrder: 0,
  status: 'ACTIVE',
};

export const CategoryAdsPage: React.FC = () => (
  <ResourcePage<AdvertisementItem>
    title="Category Ads"
    subtitle="Targeted ads shown against a state, city and/or category in the directory."
    api={advertisementsApi}
    singularLabel="Category ad"
    columns={columns}
    fields={fields}
    fixedParams={{ placement: 'CATEGORY' }}
    hiddenFormValues={{ placement: 'CATEGORY' }}
    sortableKeys={['sortOrder', 'title']}
    defaultSortBy="sortOrder"
    searchPlaceholder="Search by title, category or city"
    emptyFormValues={emptyValues}
    rowLabel={(row) => row.title || `Ad #${row.id}`}
    toFormValues={(row) => ({
      title: row.title ?? '',
      state: row.state ?? '',
      city: row.city ?? '',
      category: row.category ?? '',
      linkUrl: row.linkUrl ?? '',
      image: row.imageUrl ?? '',
      sortOrder: row.sortOrder,
      status: row.status,
    })}
  />
);
