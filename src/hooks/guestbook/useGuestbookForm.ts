import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { guestbookFormSchema, type GuestbookForm } from '@/models';

const DEFAULT_FORM_VALUES: GuestbookForm = {
  nickname: '',
  location: '',
  website: '',
  message: '',
};

export const useGuestbookForm = (onSubmit: SubmitHandler<GuestbookForm>) => {
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
    handleSubmit: handleSubmit(onSubmit),
    reset,
    errors,
    isSubmitting,
  };
};
