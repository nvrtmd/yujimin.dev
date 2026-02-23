'use client';

import { useState, useEffect } from 'react';
import { type GuestbookForm } from '@/models';
import { Button, Input, Textarea } from '@/components/common';
import { useGuestbookForm } from '@/hooks/guestbook/useGuestbookForm';
import { parseWithZod } from '@/libs/parseWithZod';
import { guestbookEntryResponseSchema } from '@/models';

const CONFIG = {
  MESSAGE_DISPLAY_DURATION: 3000,
  TEXTAREA_ROWS: 2,
} as const;

const PLACEHOLDER = {
  NICKNAME: 'yuza',
  LOCATION: 'Seoul, Korea',
  WEBSITE: 'https://example.com',
} as const;

const TEXT = {
  SUBMIT: 'Submit',
  SUBMITTING: 'Submitting...',
  SUCCESS: 'Message added successfully!',
  ERROR_FALLBACK: 'Failed to submit.',
  ERROR_NETWORK: 'An unexpected network error occurred.',
} as const;

const ERROR_LOG = {
  API: 'API Error (onSubmit):',
  SUBMIT: 'Submit error (onSubmit):',
} as const;

const STYLE = {
  SUCCESS: 'bg-green-100 border-green-400 text-green-700',
  ERROR: 'bg-red-100 border-red-400 text-red-700',
} as const;

interface GuestbookFormProps {
  refreshEntries: () => void;
}

function RequiredIndicator() {
  return <span className='text-red-500'>*</span>;
}

function getResultStyle(type: 'success' | 'error'): string {
  return type === 'success' ? STYLE.SUCCESS : STYLE.ERROR;
}

export function GuestbookForm({ refreshEntries }: GuestbookFormProps) {
  const [submitResult, setSubmitResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!submitResult) return;

    const timer = setTimeout(() => {
      setSubmitResult(null);
    }, CONFIG.MESSAGE_DISPLAY_DURATION);

    return () => clearTimeout(timer);
  }, [submitResult]);

  const { register, handleSubmit, errors, isSubmitting } = useGuestbookForm(
    async (inputData, { reset }) => {
      try {
        const response = await fetch('/api/guestbook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inputData),
        });

        const data = await response.json();
        const parsedData = parseWithZod(data, guestbookEntryResponseSchema);

        if (parsedData.success) {
          refreshEntries();
          setSubmitResult({ type: 'success', message: TEXT.SUCCESS });
          reset();
        } else {
          console.error(ERROR_LOG.API, parsedData.error);
          setSubmitResult({
            type: 'error',
            message: parsedData.error || TEXT.ERROR_FALLBACK,
          });
        }
      } catch (error) {
        console.error(ERROR_LOG.SUBMIT, error);
        setSubmitResult({ type: 'error', message: TEXT.ERROR_NETWORK });
      }
    },
  );

  return (
    <form
      onSubmit={handleSubmit}
      className='border-gray-400 flex flex-col gap-3'
    >
      <Input
        label={
          <span className='flex items-center gap-1'>
            Nickname
            <RequiredIndicator />
          </span>
        }
        error={errors.nickname?.message}
        {...register('nickname')}
        placeholder={PLACEHOLDER.NICKNAME}
      />

      <Input
        label='Location'
        error={errors.location?.message}
        {...register('location')}
        placeholder={PLACEHOLDER.LOCATION}
      />

      <Input
        label='Website'
        error={errors.website?.message}
        {...register('website')}
        placeholder={PLACEHOLDER.WEBSITE}
        type='url'
      />

      <Textarea
        label={
          <span className='flex items-center gap-1'>
            Message
            <RequiredIndicator />
          </span>
        }
        error={errors.message?.message}
        {...register('message')}
        rows={CONFIG.TEXTAREA_ROWS}
      />

      <Button
        type='submit'
        disabled={isSubmitting}
        className='btn-outset px-4 py-1 bg-[var(--color-window-bg)] self-end'
      >
        {TEXT.SUBMIT}
      </Button>

      {submitResult && (
        <div
          data-testid={`submit-result-${submitResult.type}`}
          className={`p-2 border ${getResultStyle(submitResult.type)}`}
        >
          {submitResult.message}
        </div>
      )}
    </form>
  );
}
