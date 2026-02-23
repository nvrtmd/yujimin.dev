import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { guestbookFormSchema, type GuestbookForm } from '@/models';

const DEFAULT_FORM_VALUES: GuestbookForm = {
  nickname: '',
  location: '',
  website: '',
  message: '',
};

type SubmitCallback = (
  inputData: GuestbookForm,
  helpers: { reset: () => void },
) => Promise<void>;

export const useGuestbookForm = (onSubmit: SubmitCallback) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GuestbookForm>({
    resolver: zodResolver(guestbookFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  return {
    register,
    handleSubmit: handleSubmit((data) => onSubmit(data, { reset })),
    reset,
    errors,
    isSubmitting,
  };
};
