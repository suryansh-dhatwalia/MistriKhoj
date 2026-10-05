import React from 'react';
import { Link, Typography } from '@mui/material';
import { mistriNewsApi } from '../api/content.api';
import type { MistriNewsItem } from '../types/content.types';
import { ResourcePage } from '../components/resource/ResourcePage';
import { StatusChip } from '../components/resource/StatusChip';
import { statusField, sortOrderField } from '../components/resource/fieldPresets';
import type { ColumnDef, FieldDef } from '../components/resource/resourceConfig';

const columns: ColumnDef<MistriNewsItem>[] = [
  { key: 'sortOrder', header: '#', width: 60 },
  {
    key: 'message',
    header: 'Message',
    render: (row) => (
      <Typography variant="body2" sx={{ fontWeight: 700, maxWidth: 420 }}>
        {row.message}
      </Typography>
    ),
  },
  {
    key: 'linkUrl',
    header: 'Article Link',
    render: (row) => (
      <Link href={row.linkUrl} target="_blank" rel="noopener" sx={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>
        {row.linkUrl}
      </Link>
    ),
  },
  { key: 'status', header: 'Status', render: (row) => <StatusChip status={row.status} /> },
];

const fields: FieldDef[] = [
  {
    type: 'textarea',
    name: 'message',
    label: 'News message',
    required: true,
    helperText: 'Shown in the scrolling strip on the homepage, e.g. a new government law or scheme for Mistris.',
  },
  { type: 'text', name: 'linkUrl', label: 'Full article link (URL)', required: true, placeholder: 'https://…' },
  sortOrderField,
  statusField,
];

const emptyValues = {
  message: '',
  linkUrl: '',
  sortOrder: 0,
  status: 'ACTIVE',
};

export const MistriNewsPage: React.FC = () => (
  <ResourcePage<MistriNewsItem>
    title="Mistri News"
    subtitle="The scrolling news strip shown on the homepage before the ad banners — e.g. new government laws or schemes affecting Mistris. Each item links out to the full article."
    api={mistriNewsApi}
    singularLabel="News item"
    columns={columns}
    fields={fields}
    sortableKeys={['sortOrder', 'createdAt']}
    defaultSortBy="sortOrder"
    searchPlaceholder="Search by message"
    emptyFormValues={emptyValues}
    rowLabel={(row) => row.message}
    toFormValues={(row) => ({
      message: row.message,
      linkUrl: row.linkUrl,
      sortOrder: row.sortOrder,
      status: row.status,
    })}
  />
);
