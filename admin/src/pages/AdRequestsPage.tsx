import React from 'react';
import { Box, Chip, Link, Typography } from '@mui/material';
import { adRequestsApi } from '../api/content.api';
import type { AdRequestItem, AdRequestStatus } from '../types/content.types';
import { ResourcePage } from '../components/resource/ResourcePage';
import type { ColumnDef, FieldDef } from '../components/resource/resourceConfig';
import { formatDate, formatPhoneNumber } from '../utils/format.utils';

const STATUS_COLORS: Record<AdRequestStatus, { bg: string; fg: string }> = {
  NEW: { bg: '#EFF6FF', fg: '#2563EB' },
  CONTACTED: { bg: '#FFFBEB', fg: '#D97706' },
  APPROVED: { bg: '#F0FDF4', fg: '#16A34A' },
  REJECTED: { bg: '#FEF2F2', fg: '#DC2626' },
};

const DURATION_LABELS: Record<string, string> = {
  '1_week': '1 Week',
  '1_month': '1 Month',
  '3_months': '3 Months',
  '6_months': '6 Months',
};

const columns: ColumnDef<AdRequestItem>[] = [
  {
    key: 'companyName',
    header: 'Business',
    render: (row) => (
      <div>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {row.companyName}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
          {row.email}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
          {formatPhoneNumber(row.contactNumber)}
        </Typography>
      </div>
    ),
  },
  {
    key: 'adType',
    header: 'Ad',
    render: (row) => (
      <div>
        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
          {row.adType}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {DURATION_LABELS[row.duration] ?? row.duration}
        </Typography>
      </div>
    ),
  },
  {
    key: 'creativeUrl',
    header: 'Creative',
    render: (row) =>
      row.creativeUrl ? (
        <Box
          component="img"
          src={row.creativeUrl}
          alt="creative"
          sx={{ width: 80, height: 40, objectFit: 'cover', borderRadius: 1, border: '1px solid #E5E7EB' }}
        />
      ) : (
        '—'
      ),
  },
  {
    key: 'targetUrl',
    header: 'Target URL',
    render: (row) =>
      row.targetUrl ? (
        <Link href={row.targetUrl} target="_blank" rel="noopener" sx={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>
          {row.targetUrl}
        </Link>
      ) : (
        '—'
      ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => {
      const tone = STATUS_COLORS[row.status];
      return <Chip size="small" label={row.status} sx={{ fontWeight: 700, backgroundColor: tone.bg, color: tone.fg }} />;
    },
  },
  {
    key: 'advertisementId',
    header: 'Published',
    render: (row) =>
      row.advertisementId ? (
        <Chip
          size="small"
          label={`Ad #${row.advertisementId}`}
          sx={{ fontWeight: 700, backgroundColor: '#F0FDF4', color: '#16A34A' }}
        />
      ) : (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          —
        </Typography>
      ),
  },
  { key: 'createdAt', header: 'Submitted', render: (row) => formatDate(row.createdAt) },
];

const fields: FieldDef[] = [
  {
    type: 'select',
    name: 'status',
    label: 'Status',
    required: true,
    options: [
      { value: 'NEW', label: 'New' },
      { value: 'CONTACTED', label: 'Contacted' },
      { value: 'APPROVED', label: 'Approved' },
      { value: 'REJECTED', label: 'Rejected' },
    ],
  },
];

export const AdRequestsPage: React.FC = () => (
  <ResourcePage<AdRequestItem>
    title="Ad Requests"
    subtitle='Submissions from the "Advertise With Us" form. Setting one to Approved publishes it — image ads to Banner Ads, video ads to Videos — and reverting takes that ad offline.'
    api={adRequestsApi}
    singularLabel="Ad request"
    columns={columns}
    fields={fields}
    canCreate={false}
    sortableKeys={['createdAt', 'companyName', 'status']}
    defaultSortBy="createdAt"
    defaultSortOrder="desc"
    searchPlaceholder="Search by company, email or phone"
    emptyFormValues={{ status: 'NEW' }}
    rowLabel={(row) => `${row.companyName} request`}
    toFormValues={(row) => ({ status: row.status })}
  />
);
