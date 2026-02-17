'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface PropertySubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const schema = z.object({
  title: z.string().min(3, 'Please enter a title'),
  location: z.string().min(2, 'Please enter a location'),
  type: z.string().min(1, 'Select a type'),
  price: z.coerce.number().positive('Enter a valid price'),
  currency: z.enum(['GEL','USD','EUR']),
  transaction: z.enum(['sale','rent']),
  bedrooms: z.coerce.number().int().min(0, 'Invalid'),
  bathrooms: z.coerce.number().int().min(0, 'Invalid'),
  area: z.coerce.number().positive('Enter area'),
  description: z.string().min(10, 'Description too short'),
  amenities: z.array(z.string()).optional(),
  contactName: z.string().min(2, 'Enter contact name'),
  contactPhone: z.string().min(7, 'Enter valid phone'),
  latitude: z.union([z.coerce.number(), z.literal('')]).optional(),
  longitude: z.union([z.coerce.number(), z.literal('')]).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function PropertySubmitModal({ isOpen, onClose }: PropertySubmitModalProps) {
  const [images, setImages] = useState<{ file: File; url: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      location: '',
      type: 'apartment',
      price: undefined as unknown as number,
      currency: 'GEL',
      transaction: 'sale',
      bedrooms: 1,
      bathrooms: 1,
      area: undefined as unknown as number,
      description: '',
      amenities: [],
      contactName: '',
      contactPhone: '',
      latitude: '' as unknown as number,
      longitude: '' as unknown as number,
    },
  });

  useEffect(() => {
    if (!isOpen) {
      // cleanup previews and reset form when closing
      images.forEach((img) => URL.revokeObjectURL(img.url));
      setImages([]);
      reset();
    }
  }, [images, isOpen, reset]);

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.url));
    };
  }, [images]);

  const acceptTypes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']);
  const MAX_SIZE_MB = 8;
  const MAX_FILES = 10;

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const next: { file: File; url: string }[] = [];
    for (const f of Array.from(files)) {
      if (!acceptTypes.has(f.type)) continue;
      if (f.size > MAX_SIZE_MB * 1024 * 1024) continue;
      next.push({ file: f, url: URL.createObjectURL(f) });
    }
    setImages((prev) => {
      const merged = [...prev, ...next].slice(0, MAX_FILES);
      return merged;
    });
  };

  const removeImageAt = (idx: number) => {
    setImages((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(idx, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return copy;
    });
  };

  const onSubmit = async (data: FormValues) => {
    console.log('Submit property:', data, { imagesCount: images.length });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 overflow-y-auto" onClick={(e) => { if (e.currentTarget === e.target) onClose(); }}>
        <div className="mx-auto max-w-3xl px-4 py-10" onClick={(e) => e.stopPropagation()}>
          <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-gray-900 shadow-xl">
            <div className="px-6 py-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Property</h2>
              <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-sm bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-200">Close</button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <Controller name="title" control={control} render={({ field }) => (
                  <input {...field} className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" placeholder="Modern 2BR in Vake" />
                )} />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <Controller name="location" control={control} render={({ field }) => (
                  <input {...field} className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" placeholder="Vake, Tbilisi" />
                )} />
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <Controller name="type" control={control} render={({ field }) => (
                  <select {...field} className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="commercial">Commercial</option>
                  </select>
                )} />
                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Price</label>
                <Controller name="price" control={control} render={({ field }) => (
                  <input type="number" min={0} step={1000} {...field} className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" placeholder="300000" />
                )} />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Currency</label>
                <Controller name="currency" control={control} render={({ field }) => (
                  <select {...field} className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                    <option value="GEL">GEL</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                )} />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Transaction</label>
                <Controller name="transaction" control={control} render={({ field }) => (
                  <select {...field} className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                )} />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Bedrooms</label>
                <Controller name="bedrooms" control={control} render={({ field }) => (
                  <input type="number" min={0} {...field} className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                )} />
                {errors.bedrooms && <p className="text-red-500 text-xs mt-1">{errors.bedrooms.message}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Bathrooms</label>
                <Controller name="bathrooms" control={control} render={({ field }) => (
                  <input type="number" min={0} {...field} className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                )} />
                {errors.bathrooms && <p className="text-red-500 text-xs mt-1">{errors.bathrooms.message}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Area (m²)</label>
                <Controller name="area" control={control} render={({ field }) => (
                  <input type="number" min={1} step={1} {...field} className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                )} />
                {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <Controller name="description" control={control} render={({ field }) => (
                  <textarea rows={5} {...field} className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" placeholder="Describe the property..." />
                )} />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Amenities</label>
                <Controller name="amenities" control={control} render={({ field }) => (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {['Balcony','Terrace','Parking','Elevator','Pets Allowed','Furnished'].map((a) => {
                      const checked = (field.value || []).includes(a);
                      return (
                        <label key={a} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={checked}
                            onChange={(e) => {
                              const next = new Set(field.value || []);
                              if (e.target.checked) next.add(a); else next.delete(a);
                              field.onChange(Array.from(next));
                            }}
                          />
                          <span>{a}</span>
                        </label>
                      );
                    })}
                  </div>
                )} />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Photos (optional)</span>
                  <span className="text-xs text-gray-500">Up to {MAX_FILES} images, JPG/PNG/WebP/AVIF, {MAX_SIZE_MB}MB each</span>
                </div>
                <div
                  className="mt-2 p-6 rounded-lg border border-dashed border-black/10 dark:border-white/10 text-sm text-gray-600 dark:text-gray-300 bg-black/5 dark:bg-white/5 text-center cursor-pointer"
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Drag & drop images here or <span className="underline">browse</span>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                </div>
                {images.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 md:grid-cols-4 gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img.url} alt={`upload-${idx}`} className="w-full h-24 object-cover rounded-lg border border-black/10 dark:border-white/10" />
                        <button
                          type="button"
                          onClick={() => removeImageAt(idx)}
                          className="absolute top-1 right-1 px-2 py-0.5 rounded-md text-xs bg-black/70 text-white opacity-0 group-hover:opacity-100 transition"
                          aria-label="Remove image"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Contact Name</label>
                <Controller name="contactName" control={control} render={({ field }) => (
                  <input {...field} className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                )} />
                {errors.contactName && <p className="text-red-500 text-xs mt-1">{errors.contactName.message}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Contact Phone</label>
                <Controller name="contactPhone" control={control} render={({ field }) => (
                  <input {...field} className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" placeholder="+995 5XX XX XX XX" />
                )} />
                {errors.contactPhone && <p className="text-red-500 text-xs mt-1">{errors.contactPhone.message}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Latitude (optional)</label>
                <Controller name="latitude" control={control} render={({ field }) => (
                  <input type="number" step="any" {...field} className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                )} />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Longitude (optional)</label>
                <Controller name="longitude" control={control} render={({ field }) => (
                  <input type="number" step="any" {...field} className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                )} />
              </div>

              <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-black/10 dark:border-white/10 text-gray-700 dark:text-gray-200">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-lg bg-[#F08336] hover:bg-[#e0743a] text-white font-semibold disabled:opacity-60">Submit</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}


