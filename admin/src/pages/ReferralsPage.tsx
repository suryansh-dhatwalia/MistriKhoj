import React, { useEffect, useMemo, useState } from 'react';
import { Button, Chip, Link, Typography } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import { referralExtrasApi, referralsApi } from '../api/content.api';
import type { ReferralItem } from '../types/content.types';
import { ResourcePage } from '../components/resource/ResourcePage';
import { StatusChip } from '../components/resource/StatusChip';
import { statusField } from '../components/resource/fieldPresets';
import type { ColumnDef, FieldDef } from '../components/resource/resourceConfig';
import { ReferralMistrisDialog } from '../components/referrals/ReferralMistrisDialog';
import { formatPhoneNumber } from '../utils/format.utils';

const REGISTER_BASE =
  (import.meta.env.VITE_PUBLIC_WEBSITE_URL || 'http://localhost:5173') + '/register-mistri?refcode=';

const fields: FieldDef[] = [
  { type: 'text', name: 'code', label: 'Referral code', required: true, helperText: 'Letters, numbers, - and _ only.' },
  { type: 'text', name: 'name', label: 'Referrer name', required: true },
  { type: 'text', name: 'phone', label: 'Referrer phone', required: true },
  statusField,
];

const emptyValues = { code: '', name: '', phone: '', status: 'ACTIVE' };

export const ReferralsPage: React.FC = () => {
  const [leadCounts, setLeadCounts] = useState<Record<string, number>>({});
  const [drillReferral, setDrillReferral] = useState<ReferralItem | null>(null);

  useEffect(() => {
    referralExtrasApi
      .leadCounts()
      .then((rows) => {
        const map: Record<string, number> = {};
        for (const row of rows) map[row.code] = row.count;
        setLeadCounts(map);
      })
      .catch(() => setLeadCounts({}));
  }, []);

  const columns = useMemo<ColumnDef<ReferralItem>[]>(
    () => [
      {
        key: 'code',
        header: 'Referral code',
        render: (row) => (
          <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
            {row.code}
          </Typography>
        ),
      },
      { key: 'name', header: 'Name' },
      { key: 'phone', header: 'Phone', render: (row) => formatPhoneNumber(row.phone) },
      {
        key: 'leads',
        header: 'Registrations',
        render: (row) => (
          <Chip
            size="small"
            label={leadCounts[row.code] ?? 0}
            sx={{ fontWeight: 700, backgroundColor: '#EFF6FF', color: '#2563EB' }}
          />
        ),
      },
      {
        key: 'url',
        header: 'Register URL',
        render: (row) => (
          <Link
            href={REGISTER_BASE + encodeURIComponent(row.code)}
            target="_blank"
            rel="noopener"
            sx={{ fontSize: '0.75rem', wordBreak: 'break-all' }}
          >
            {REGISTER_BASE + row.code}
          </Link>
        ),
      },
      { key: 'status', header: 'Status', render: (row) => <StatusChip status={row.status} /> },
    ],
    [leadCounts],
  );

  return (
    <>
      <ResourcePage<ReferralItem>
        title="Referrals"
        subtitle="Referral codes technicians can register with. Registration counts update as Mistris sign up."
        api={referralsApi}
        singularLabel="Referral"
        columns={columns}
        fields={fields}
        sortableKeys={['createdAt', 'code', 'name']}
        defaultSortBy="createdAt"
        defaultSortOrder="desc"
        searchPlaceholder="Search by code, name or phone"
        emptyFormValues={emptyValues}
        rowLabel={(row) => row.code}
        toFormValues={(row) => ({
          code: row.code,
          name: row.name,
          phone: row.phone,
          status: row.status,
        })}
        extraActions={(row) => (
          <Button
            size="small"
            startIcon={<GroupsIcon fontSize="small" />}
            onClick={() => setDrillReferral(row)}
            sx={{ fontSize: '0.6875rem' }}
          >
            View {leadCounts[row.code] ?? 0}
          </Button>
        )}
      />
      <ReferralMistrisDialog
        referral={drillReferral}
        open={Boolean(drillReferral)}
        onClose={() => setDrillReferral(null)}
      />
    </>
  );
};
