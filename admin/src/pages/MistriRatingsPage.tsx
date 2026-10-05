import React from 'react';
import { Rating, Typography } from '@mui/material';
import { mistriRatingsApi } from '../api/content.api';
import type { MistriRatingItem } from '../types/content.types';
import { ResourcePage } from '../components/resource/ResourcePage';
import { StatusChip } from '../components/resource/StatusChip';
import { formatDate } from '../utils/format.utils';
import type { ColumnDef, FieldDef } from '../components/resource/resourceConfig';

const columns: ColumnDef<MistriRatingItem>[] = [
  {
    key: 'mistriId',
    header: 'Mistri',
    render: (row) => <Typography variant="body2" sx={{ fontWeight: 700 }}>MST-{String(row.mistriId).padStart(6, '0')}</Typography>,
  },
  { key: 'rating', header: 'Stars', render: (row) => <Rating value={row.rating} readOnly size="small" /> },
  { key: 'status', header: 'Status', render: (row) => <StatusChip status={row.status} /> },
  { key: 'createdAt', header: 'Submitted', render: (row) => formatDate(row.createdAt) },
];

const fields: FieldDef[] = [
  {
    type: 'select',
    name: 'status',
    label: 'Status',
    required: true,
    options: [
      { value: 'ACTIVE', label: 'Active — counts toward the average' },
      { value: 'INACTIVE', label: 'Inactive — hidden, excluded from the average' },
    ],
  },
];

export const MistriRatingsPage: React.FC = () => (
  <ResourcePage<MistriRatingItem>
    title="Mistri Ratings"
    subtitle="Anonymous star ratings submitted by site visitors on a Mistri's profile. There is no customer login, so anyone can rate — set a fake or abusive one to Inactive to exclude it from that Mistri's public average, or delete it."
    api={mistriRatingsApi}
    singularLabel="Rating"
    columns={columns}
    fields={fields}
    canCreate={false}
    sortableKeys={['createdAt', 'rating']}
    defaultSortBy="createdAt"
    defaultSortOrder="desc"
    searchPlaceholder="Search…"
    emptyFormValues={{ status: 'ACTIVE' }}
    rowLabel={(row) => `${row.rating}-star rating on MST-${String(row.mistriId).padStart(6, '0')}`}
    toFormValues={(row) => ({ status: row.status })}
  />
);
