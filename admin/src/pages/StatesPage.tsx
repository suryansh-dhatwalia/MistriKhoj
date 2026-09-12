import React from 'react';
import { Typography } from '@mui/material';
import { statesApi } from '../api/content.api';
import type { StateItem } from '../types/content.types';
import { ResourcePage } from '../components/resource/ResourcePage';
import { StatusChip } from '../components/resource/StatusChip';
import { statusField, sortOrderField } from '../components/resource/fieldPresets';
import type { ColumnDef, FieldDef } from '../components/resource/resourceConfig';

const columns: ColumnDef<StateItem>[] = [
  { key: 'sortOrder', header: '#', width: 60 },
  {
    key: 'name',
    header: 'State',
    render: (row) => (
      <div>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {row.name}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {row.regionalTitle || '—'}
        </Typography>
      </div>
    ),
  },
  { key: 'code', header: 'Code', width: 90 },
  { key: 'activeTechniciansCount', header: 'Technicians', align: 'right' },
  { key: 'status', header: 'Status', render: (row) => <StatusChip status={row.status} /> },
];

const fields: FieldDef[] = [
  { type: 'text', name: 'name', label: 'State name', required: true },
  { type: 'text', name: 'code', label: 'Short code', required: true, placeholder: 'e.g. MH', helperText: 'Up to 8 characters.' },
  { type: 'text', name: 'regionalTitle', label: 'Regional title', placeholder: 'महाराष्ट्र' },
  { type: 'text', name: 'tagline', label: 'Tagline' },
  { type: 'number', name: 'activeTechniciansCount', label: 'Displayed technician count', min: 0 },
  sortOrderField,
  statusField,
];

const emptyValues = {
  name: '',
  code: '',
  regionalTitle: '',
  tagline: '',
  activeTechniciansCount: 0,
  sortOrder: 0,
  status: 'ACTIVE',
};

export const StatesPage: React.FC = () => (
  <ResourcePage<StateItem>
    title="States"
    subtitle="States shown across the public directory, filters and registration form."
    api={statesApi}
    singularLabel="State"
    columns={columns}
    fields={fields}
    sortableKeys={['sortOrder', 'name', 'code']}
    defaultSortBy="sortOrder"
    searchPlaceholder="Search by name or code"
    emptyFormValues={emptyValues}
    rowLabel={(row) => row.name}
    toFormValues={(row) => ({
      name: row.name,
      code: row.code,
      regionalTitle: row.regionalTitle ?? '',
      tagline: row.tagline ?? '',
      activeTechniciansCount: row.activeTechniciansCount,
      sortOrder: row.sortOrder,
      status: row.status,
    })}
  />
);
