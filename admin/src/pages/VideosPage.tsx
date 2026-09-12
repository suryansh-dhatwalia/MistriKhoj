import React from 'react';
import { Link, Typography } from '@mui/material';
import { advertisementsApi } from '../api/content.api';
import type { AdvertisementItem } from '../types/content.types';
import { ResourcePage } from '../components/resource/ResourcePage';
import { StatusChip } from '../components/resource/StatusChip';
import { statusField, sortOrderField } from '../components/resource/fieldPresets';
import type { ColumnDef, FieldDef } from '../components/resource/resourceConfig';

const columns: ColumnDef<AdvertisementItem>[] = [
  { key: 'sortOrder', header: '#', width: 60 },
  {
    key: 'title',
    header: 'Title',
    render: (row) => (
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {row.title || '—'}
      </Typography>
    ),
  },
  {
    key: 'videoUrl',
    header: 'Link',
    render: (row) =>
      row.videoUrl ? (
        <Link href={row.videoUrl} target="_blank" rel="noopener" sx={{ fontSize: '0.8125rem', wordBreak: 'break-all' }}>
          {row.videoUrl}
        </Link>
      ) : (
        '—'
      ),
  },
  { key: 'status', header: 'Status', render: (row) => <StatusChip status={row.status} /> },
];

const fields: FieldDef[] = [
  { type: 'text', name: 'title', label: 'Title', required: true },
  {
    type: 'text',
    name: 'videoUrl',
    label: 'Video embed URL',
    required: true,
    placeholder: 'https://player.vimeo.com/video/…',
  },
  sortOrderField,
  statusField,
];

const emptyValues = { title: '', videoUrl: '', sortOrder: 0, status: 'ACTIVE' };

export const VideosPage: React.FC = () => (
  <ResourcePage<AdvertisementItem>
    title="Videos"
    subtitle="Promotional / testimonial videos embedded on the public site."
    api={advertisementsApi}
    singularLabel="Video"
    columns={columns}
    fields={fields}
    fixedParams={{ placement: 'VIDEO' }}
    hiddenFormValues={{ placement: 'VIDEO' }}
    sortableKeys={['sortOrder', 'title']}
    defaultSortBy="sortOrder"
    searchPlaceholder="Search videos"
    emptyFormValues={emptyValues}
    rowLabel={(row) => row.title || `Video #${row.id}`}
    toFormValues={(row) => ({
      title: row.title ?? '',
      videoUrl: row.videoUrl ?? '',
      sortOrder: row.sortOrder,
      status: row.status,
    })}
  />
);
