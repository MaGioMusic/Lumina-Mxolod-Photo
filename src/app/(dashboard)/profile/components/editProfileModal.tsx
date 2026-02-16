'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'მინიმუმ 2 სიმბოლო'),
  lastName: z
    .string()
    .trim()
    .min(2, 'მინიმუმ 2 სიმბოლო'),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => val.length === 0 || val.replace(/\D/g, '').length >= 6,
      'მინიმუმ 6 ციფრი'
    ),
  avatarUrl: z
    .string()
    .trim()
    .refine(
      (val) => val.length === 0 || z.string().url().safeParse(val).success,
      'სწორი URL მიუთითე'
    ),
});

export type EditProfileFormValues = z.infer<typeof profileSchema>;

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  initial: EditProfileFormValues;
  onSave: (values: EditProfileFormValues) => void;
}

export default function EditProfileModal({ open, onClose, initial, onSave }: EditProfileModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: initial,
  });

  useEffect(() => {
    reset(initial);
  }, [initial, reset]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/90 p-6 shadow-2xl backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/85">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">პროფილის რედაქტირება</h3>

        <form
          className="mt-5 space-y-4"
          onSubmit={handleSubmit((values) => onSave(values))}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">სახელი</label>
              <input
                {...register('firstName')}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">გვარი</label>
              <input
                {...register('lastName')}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">ტელეფონი</label>
            <input
              {...register('phone')}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">ავატარის URL</label>
            <input
              placeholder="/images/photos/Agents/agent-2.jpg"
              {...register('avatarUrl')}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            {errors.avatarUrl && <p className="mt-1 text-xs text-red-500">{errors.avatarUrl.message}</p>}
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">მაგალითად: /images/photos/Agents/agent-2.jpg</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 dark:bg-slate-800 dark:text-slate-200"
              disabled={isSubmitting}
            >
              გაუქმება
            </button>
            <button
              type="submit"
              className="rounded-lg bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 disabled:opacity-70"
              disabled={isSubmitting}
            >
              შენახვა
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
