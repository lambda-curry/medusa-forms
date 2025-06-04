import type React from 'react';

// Basic field props interface
export interface BasicFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
  helperText?: string;
}

// Generic field wrapper props
export interface FieldWrapperProps<T> extends BasicFieldProps, T {
  children: React.ReactNode;
}
