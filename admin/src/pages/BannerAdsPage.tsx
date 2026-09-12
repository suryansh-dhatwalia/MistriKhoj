import React from 'react';
import { Box, Typography } from '@mui/material';
import { advertisementsApi } from '../api/content.api';
import type { AdvertisementItem } from '../types/content.types';
import { ResourcePage } from '../components/resource/ResourcePage';
import { StatusChip } from '../components/resource/StatusChip';
import { statusField, sortOrderField } from '../components/resource/fieldPresets';
import type { ColumnDef, FieldDef } from '../components/resource/resourceConfig';

const isVideoAd = (row: AdvertisementItem) => Boolean(row.videoUrl) && !row.imageUrl;

const columns: ColumnDef<AdvertisementItem>[] = [
  { key: 'sortOrder', header: '#', width: 60 },
  {
    key: 'imageUrl',
    header: 'Banner',
    render: (row) => {
      const frameSx = {
        width: 96,
        height: 44,
        objectFit: 'cover' as const,
        borderRadius: 1,
        border: '1px solid #E5E7EB',
      };
      if (isVideoAd(row)) {
        return <Box component="video" src={row.videoUrl ?? ''} muted sx={{ ...frameSx, backgroundColor: '#000' }} />;
      }
      if (row.imageUrl) {
        return <Box component="img" src={row.imageUrl} alt={row.title ?? ''} sx={frameSx} />;
      }
      return '—';
    },
  },
  {
    key: 'title',
    header: 'Title',
    render: (row) => (
      <div>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {row.title || '—'}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {row.companyName || '—'} · {isVideoAd(row) ? 'Video' : 'Image'}
        </Typography>
      </div>
    ),
  },
  { key: 'status', header: 'Status', render: (row) => <StatusChip status={row.status} /> },
];

const fields: FieldDef[] = [
  { type: 'text', name: 'title', label: 'Headline', required: true },
  { type: 'text', name: 'companyName', label: 'Sponsor / company name' },
  { type: 'textarea', name: 'description', label: 'Description' },
  { type: 'text', name: 'ctaText', label: 'Button text', placeholder: 'View Offers' },
  { type: 'text', name: 'linkUrl', label: 'Button link (URL)', placeholder: 'https://…' },
  {
    type: 'select',
    name: 'adType',
    label: 'Creative type',
    options: [
      { value: 'image', label: 'Image' },
      { value: 'video', label: 'Video' },
    ],
    helperText: 'A banner is either an image or a video.',
  },
  {
    type: 'image',
    name: 'image',
    label: 'Banner image',
    required: true,
    helperText: 'Any orientation — shown uncropped on the homepage banner.',
    showWhen: { field: 'adType', equals: ['image'] },
  },
  {
    type: 'video',
    name: 'video',
    label: 'Banner video',
    required: true,
    helperText: 'MP4, WebM or MOV up to 45 MB. Plays muted on loop, any orientation, uncropped.',
    showWhen: { field: 'adType', equals: ['video'] },
  },
  sortOrderField,
  statusField,
];

const emptyValues = {
  title: '',
  companyName: '',
  description: '',
  ctaText: '',
  linkUrl: '',
  adType: 'image',
  image: '',
  video: '',
  sortOrder: 0,
  status: 'ACTIVE',
};

export const BannerAdsPage: React.FC = () => (
  <ResourcePage<AdvertisementItem>
    title="Banner Ads"
    subtitle="The rotating sponsor banner on the public homepage — image or video."
    api={advertisementsApi}
    singularLabel="Banner"
    columns={columns}
    fields={fields}
    fixedParams={{ placement: 'HOME_BANNER' }}
    hiddenFormValues={{ placement: 'HOME_BANNER' }}
    sortableKeys={['sortOrder', 'title']}
    defaultSortBy="sortOrder"
    searchPlaceholder="Search banners"
    emptyFormValues={emptyValues}
    rowLabel={(row) => row.title || `Banner #${row.id}`}
    toFormValues={(row) => ({
      title: row.title ?? '',
      companyName: row.companyName ?? '',
      description: row.description ?? '',
      ctaText: row.ctaText ?? '',
      linkUrl: row.linkUrl ?? '',
      adType: isVideoAd(row) ? 'video' : 'image',
      image: row.imageUrl ?? '',
      video: row.videoUrl ?? '',
      sortOrder: row.sortOrder,
      status: row.status,
    })}
  />
);
