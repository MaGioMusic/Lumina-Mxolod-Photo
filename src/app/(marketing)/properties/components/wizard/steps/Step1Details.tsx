'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step1DetailsSchema, type Step1Details, emptyStep1Details } from '@/types/listing';

interface Step1DetailsFormProps {
  initialValues?: Step1Details;
  onSubmit: (values: Step1Details) => void;
}

export function Step1DetailsForm({ initialValues, onSubmit }: Step1DetailsFormProps) {
  const form = useForm<Step1Details>({
    resolver: zodResolver(step1DetailsSchema),
    defaultValues: initialValues ?? emptyStep1Details,
    mode: 'onChange',
  });

  useEffect(() => {
    const first = document.getElementById('price');
    if (first) first.focus();
  }, []);

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="mx-auto grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-2"
    >
      <div className="md:col-span-2">
        <label htmlFor="price" className="mb-1 block text-sm text-slate-700">Set Your Price</label>
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500">$</span>
          <input
            id="price"
            type="number"
            inputMode="decimal"
            step="1"
            className="w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600"
            {...form.register('price', { valueAsNumber: true })}
          />
        </div>
        {form.formState.errors.price && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.price.message}</p>
        )}
      </div>

      <div className="md:col-span-2">
        <label htmlFor="streetAddress" className="mb-1 block text-sm text-slate-700">Street Address</label>
        <input
          id="streetAddress"
          type="text"
          placeholder="e.g 11404 Silver Crown Ave, Bakersfield, CA 93312"
          className="w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600"
          {...form.register('streetAddress')}
        />
        {form.formState.errors.streetAddress && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.streetAddress.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="unit" className="mb-1 block text-sm text-slate-700">Unit (Optional)</label>
        <input id="unit" type="text" className="w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600" {...form.register('unit')} />
      </div>

      <div>
        <label htmlFor="city" className="mb-1 block text-sm text-slate-700">City</label>
        <input id="city" type="text" className="w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600" {...form.register('city')} />
        {form.formState.errors.city && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.city.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="state" className="mb-1 block text-sm text-slate-700">States</label>
        <input id="state" type="text" className="w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600" {...form.register('state')} />
        {form.formState.errors.state && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.state.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="zip" className="mb-1 block text-sm text-slate-700">ZIP</label>
        <input id="zip" type="text" className="w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600" {...form.register('zip')} />
        {form.formState.errors.zip && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.zip.message}</p>
        )}
      </div>

      <div className="md:col-span-2 mt-6 flex items-center justify-between">
        <button type="button" className="rounded-full px-4 py-2 text-slate-600 hover:text-slate-800">Cancel</button>
        <button type="submit" className="rounded-full bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700">Next</button>
      </div>
    </form>
  );
}


