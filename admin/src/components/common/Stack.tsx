import React from 'react';
import { Box, type BoxProps } from '@mui/material';

type Responsive<T> = T | { [breakpoint: string]: T };

interface StackProps extends Omit<BoxProps, 'direction'> {
  direction?: Responsive<'row' | 'column'>;
  gap?: Responsive<number>;
  justifyContent?: Responsive<string>;
  alignItems?: Responsive<string>;
  flexWrap?: string;
  mb?: number;
  mt?: number;
}

/** Flex layout helper with the familiar Stack props (MUI 9's own Stack dropped system props). */
export const Stack: React.FC<StackProps> = ({ direction = 'column', gap, justifyContent, alignItems, flexWrap, mb, mt, sx, ...rest }) => (
  <Box
    {...rest}
    sx={{ display: 'flex', flexDirection: direction, gap, justifyContent, alignItems, flexWrap, mb, mt, ...(sx as object) } as never}
  />
);
