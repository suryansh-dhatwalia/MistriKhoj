import React, { useRef, useState } from 'react';
import { Box, Button, FormHelperText, FormLabel, Typography } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ClearIcon from '@mui/icons-material/Clear';
import { brandColors } from '../../theme/theme';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
  error?: string;
  required?: boolean;
  /** 'image' (default) or 'video' — changes accepted types, size cap and preview. */
  kind?: 'image' | 'video';
}

const CONFIG = {
  image: {
    accepted: ['image/png', 'image/jpeg', 'image/webp'],
    maxBytes: 5 * 1024 * 1024,
    tooBig: 'Image must be 5 MB or smaller.',
    wrongType: 'Use a PNG, JPEG or WebP image.',
    replace: 'Replace image',
  },
  video: {
    accepted: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
    maxBytes: 45 * 1024 * 1024,
    tooBig: 'Video must be 45 MB or smaller. Trim it or lower the resolution.',
    wrongType: 'Use an MP4, WebM or MOV video.',
    replace: 'Replace video',
  },
} as const;

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  helperText,
  error,
  required,
  kind = 'image',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const cfg = CONFIG[kind];

  const handleFile = (file: File | undefined) => {
    setLocalError(null);
    if (!file) return;
    if (!(cfg.accepted as readonly string[]).includes(file.type)) {
      setLocalError(cfg.wrongType);
      return;
    }
    if (file.size > cfg.maxBytes) {
      setLocalError(cfg.tooBig);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => setLocalError('Could not read that file.');
    reader.readAsDataURL(file);
  };

  const shownError = error || localError;
  const isDataUrl = value.startsWith('data:');

  return (
    <Box>
      <FormLabel sx={{ fontSize: '0.8125rem', fontWeight: 600, color: brandColors.textPrimary }}>
        {label}
        {required ? ' *' : ''}
      </FormLabel>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
        {kind === 'video' ? (
          <Box
            sx={{
              width: 120,
              height: 68,
              borderRadius: 1,
              border: `1px solid ${brandColors.border}`,
              backgroundColor: brandColors.warmWhiteDarker,
              flexShrink: 0,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {value ? (
              <Box
                component="video"
                src={value}
                muted
                playsInline
                controls
                sx={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000' }}
              />
            ) : (
              <Typography variant="caption" sx={{ color: brandColors.textSecondary }}>
                No video
              </Typography>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              width: 96,
              height: 64,
              borderRadius: 1,
              border: `1px solid ${brandColors.border}`,
              backgroundColor: brandColors.warmWhiteDarker,
              backgroundImage: value ? `url(${value})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              flexShrink: 0,
            }}
          />
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={() => inputRef.current?.click()}
            sx={{ borderColor: brandColors.borderDark, color: brandColors.textPrimary, width: 'fit-content' }}
          >
            {value ? cfg.replace : 'Choose file'}
          </Button>
          {value && (
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={() => {
                onChange('');
                if (inputRef.current) inputRef.current.value = '';
              }}
              sx={{ color: brandColors.error, width: 'fit-content' }}
            >
              Remove
            </Button>
          )}
          {value && !isDataUrl && (
            <Typography variant="caption" sx={{ color: brandColors.textSecondary, wordBreak: 'break-all' }}>
              {value}
            </Typography>
          )}
        </Box>
      </Box>

      <input
        ref={inputRef}
        type="file"
        accept={cfg.accepted.join(',')}
        hidden
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      {(helperText || shownError) && (
        <FormHelperText error={Boolean(shownError)}>{shownError || helperText}</FormHelperText>
      )}
    </Box>
  );
};
