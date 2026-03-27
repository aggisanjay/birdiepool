'use client';
import { useToastContext } from '@/components/ui/Toast';

export function useToast() {
  return useToastContext();
}
