import React from 'react';
import { Avatar, Box, Rating, Typography } from '@mui/material';
import { testimonialsApi } from '../api/content.api';
import type { TestimonialItem } from '../types/content.types';
import { ResourcePage } from '../components/resource/ResourcePage';
import { StatusChip } from '../components/resource/StatusChip';
import { statusField, sortOrderField } from '../components/resource/fieldPresets';
import type { ColumnDef, FieldDef } from '../components/resource/resourceConfig';

const columns: ColumnDef<TestimonialItem>[] = [
  { key: 'sortOrder', header: '#', width: 60 },
  {
    key: 'author',
    header: 'Customer',
    render: (row) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Avatar src={row.avatarUrl ?? undefined} sx={{ width: 32, height: 32 }}>
          {row.author.charAt(0)}
        </Avatar>
        <div>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {row.author}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {row.location}, {row.state}
          </Typography>
        </div>
      </Box>
    ),
  },
  { key: 'rating', header: 'Rating', render: (row) => <Rating value={row.rating} readOnly size="small" /> },
  { key: 'technicianName', header: 'Technician' },
  { key: 'serviceCategory', header: 'Service' },
  { key: 'status', header: 'Status', render: (row) => <StatusChip status={row.status} /> },
];

const fields: FieldDef[] = [
  { type: 'text', name: 'author', label: 'Customer name', required: true },
  { type: 'text', name: 'location', label: 'City', required: true },
  { type: 'text', name: 'state', label: 'State', required: true },
  { type: 'number', name: 'rating', label: 'Rating (1–5)', min: 1, max: 5 },
  { type: 'text', name: 'serviceCategory', label: 'Service category', required: true },
  { type: 'text', name: 'technicianName', label: 'Technician name', required: true },
  { type: 'textarea', name: 'comment', label: 'Review text', required: true },
  { type: 'text', name: 'displayDate', label: 'Displayed date label', placeholder: '3 days ago', required: true },
  { type: 'image', name: 'avatar', label: 'Customer photo' },
  sortOrderField,
  statusField,
];

const emptyValues = {
  author: '',
  location: '',
  state: '',
  rating: 5,
  serviceCategory: '',
  technicianName: '',
  comment: '',
  displayDate: '',
  avatar: '',
  sortOrder: 0,
  status: 'ACTIVE',
};

export const TestimonialsPage: React.FC = () => (
  <ResourcePage<TestimonialItem>
    title="Testimonials"
    subtitle="Customer reviews shown in the testimonials carousel on the homepage."
    api={testimonialsApi}
    singularLabel="Testimonial"
    columns={columns}
    fields={fields}
    sortableKeys={['sortOrder', 'author', 'rating']}
    defaultSortBy="sortOrder"
    searchPlaceholder="Search by customer, technician or service"
    emptyFormValues={emptyValues}
    rowLabel={(row) => `${row.author} — ${row.serviceCategory}`}
    toFormValues={(row) => ({
      author: row.author,
      location: row.location,
      state: row.state,
      rating: row.rating,
      serviceCategory: row.serviceCategory,
      technicianName: row.technicianName,
      comment: row.comment,
      displayDate: row.displayDate,
      avatar: row.avatarUrl ?? '',
      sortOrder: row.sortOrder,
      status: row.status,
    })}
  />
);
