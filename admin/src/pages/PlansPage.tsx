import React from 'react';
import { Chip, Stack, Typography } from '@mui/material';
import { plansApi } from '../api/content.api';
import type { PlanItem } from '../types/content.types';
import { ResourcePage } from '../components/resource/ResourcePage';
import { StatusChip } from '../components/resource/StatusChip';
import { statusField, sortOrderField } from '../components/resource/fieldPresets';
import type { ColumnDef, FieldDef } from '../components/resource/resourceConfig';

const columns: ColumnDef<PlanItem>[] = [
  { key: 'sortOrder', header: '#', width: 60 },
  {
    key: 'name',
    header: 'Plan',
    render: (row) => (
      <div>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {row.name}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {row.badge}
        </Typography>
      </div>
    ),
  },
  { key: 'price', header: 'Price' },
  { key: 'duration', header: 'Duration' },
  {
    key: 'flags',
    header: 'Flags',
    render: (row) => (
      <Stack direction="row" spacing={0.5}>
        {row.popular && <Chip size="small" label="Popular" color="secondary" />}
        {row.highlighted && <Chip size="small" label="Highlighted" />}
      </Stack>
    ),
  },
  { key: 'status', header: 'Status', render: (row) => <StatusChip status={row.status} /> },
];

const fields: FieldDef[] = [
  { type: 'text', name: 'name', label: 'Plan name', required: true },
  {
    type: 'text',
    name: 'slug',
    label: 'Slug',
    required: true,
    helperText: 'Lowercase with underscores, e.g. gold_master. Stable identifier.',
  },
  { type: 'text', name: 'price', label: 'Price', required: true, placeholder: '₹599' },
  { type: 'text', name: 'duration', label: 'Duration text', required: true, placeholder: 'per month' },
  { type: 'text', name: 'badge', label: 'Badge label', required: true },
  { type: 'stringList', name: 'features', label: 'Features' },
  { type: 'text', name: 'idealFor', label: 'Ideal for', required: true },
  { type: 'switch', name: 'popular', label: 'Mark as "Popular"' },
  { type: 'switch', name: 'highlighted', label: 'Visually highlight this plan' },
  sortOrderField,
  statusField,
];

const emptyValues = {
  name: '',
  slug: '',
  price: '',
  duration: '',
  badge: '',
  features: [] as string[],
  idealFor: '',
  popular: false,
  highlighted: false,
  sortOrder: 0,
  status: 'ACTIVE',
};

export const PlansPage: React.FC = () => (
  <ResourcePage<PlanItem>
    title="Subscription Plans"
    subtitle="Pricing tiers shown on the Advertise / register-with-us page."
    api={plansApi}
    singularLabel="Plan"
    columns={columns}
    fields={fields}
    sortableKeys={['sortOrder', 'name']}
    defaultSortBy="sortOrder"
    searchPlaceholder="Search plans"
    emptyFormValues={emptyValues}
    rowLabel={(row) => row.name}
    toFormValues={(row) => ({
      name: row.name,
      slug: row.slug,
      price: row.price,
      duration: row.duration,
      badge: row.badge,
      features: row.features ?? [],
      idealFor: row.idealFor,
      popular: row.popular,
      highlighted: row.highlighted,
      sortOrder: row.sortOrder,
      status: row.status,
    })}
  />
);
