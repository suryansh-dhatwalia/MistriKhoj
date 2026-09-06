import React from 'react';
import {
  Box,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
} from '@mui/material';

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 8,
}) => {
  return (
    <TableContainer component={Paper} elevation={0}>
      <Table>
        <TableHead>
          <TableRow>
            {Array.from({ length: columns }).map((_, index) => (
              <TableCell key={`th-${index}`}>
                <Skeleton variant="text" width="80%" height={24} />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={`tr-${rowIndex}`}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={`td-${rowIndex}-${colIndex}`}>
                  {colIndex === 1 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Skeleton variant="text" width={100} height={20} />
                    </Box>
                  ) : (
                    <Skeleton
                      variant="text"
                      width={colIndex === 0 ? 40 : '75%'}
                      height={20}
                    />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export const CardGridSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={`sk-card-${i}`}>
          <Paper sx={{ p: 2.5, borderRadius: 2 }} elevation={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Skeleton variant="text" width={110} height={20} />
              <Skeleton variant="circular" width={36} height={36} />
            </Box>
            <Skeleton variant="text" width={80} height={36} sx={{ mb: 1 }} />
            <Skeleton variant="text" width={140} height={16} />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};
