import React from 'react';
import { citiesApi } from '../api/content.api';
import { loadStateIdOptions } from '../api/optionLoaders';
import type { CityItem } from '../types/content.types';
import { ResourcePage } from '../components/resource/ResourcePage';
import { StatusChip } from '../components/resource/StatusChip';
import { statusField, sortOrderField } from '../components/resource/fieldPresets';
import type { ColumnDef, FieldDef } from '../components/resource/resourceConfig';

const columns: ColumnDef<CityItem>[] = [
  { key: 'sortOrder', header: '#', width: 60 },
  { key: 'state', header: 'State', render: (row) => row.state?.name ?? `#${row.stateId}` },
  { key: 'name', header: 'City' },
  { key: 'status', header: 'Status', render: (row) => <StatusChip status={row.status} /> },
];

const fields: FieldDef[] = [
  { type: 'asyncSelect', name: 'stateId', label: 'State', required: true, loadOptions: loadStateIdOptions },
  { type: 'text', name: 'name', label: 'City name', required: true },
  sortOrderField,
  statusField,
];

const emptyValues = { stateId: '', name: '', sortOrder: 0, status: 'ACTIVE' };

export const CitiesPage: React.FC = () => (
  <ResourcePage<CityItem>
    title="Cities"
    subtitle="Cities offered under each state. Only active cities appear on the public site."
    api={citiesApi}
    singularLabel="City"
    columns={columns}
    fields={fields}
    sortableKeys={['sortOrder', 'name']}
    defaultSortBy="sortOrder"
    searchPlaceholder="Search by city name"
    emptyFormValues={emptyValues}
    rowLabel={(row) => row.name}
    toFormValues={(row) => ({
      stateId: row.stateId,
      name: row.name,
      sortOrder: row.sortOrder,
      status: row.status,
    })}
  />
);
