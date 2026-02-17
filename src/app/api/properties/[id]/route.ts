import { NextRequest } from 'next/server';
import { getPropertyDetail } from '@/lib/repo';
import { getMockPropertyById } from '@/lib/mockProperties';
import { jsonResponse, errorResponse } from '../../utils';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // Demo/mock support: /api/properties returns ids like "mock-7".
    // Make /api/properties/:id resolve those ids to distinct mock details,
    // so clicking any card opens the correct property.
    const rawId = String(id || '');
    const mockMatch = /^mock-(\d+)$/.exec(rawId);
    const numericMatch = /^\d+$/.exec(rawId);
    const mockNumericId = mockMatch ? Number(mockMatch[1]) : numericMatch ? Number(rawId) : null;
    if (mockNumericId && Number.isFinite(mockNumericId)) {
      const mp = getMockPropertyById(mockNumericId);
      if (mp) {
        const city = 'Tbilisi';
        const district = mp.address;
        const location = `${city} ${district}`.trim();
        const transactionType = mp.status === 'for-rent' ? 'rent' : 'sale';
        const propertyType = (mp.type || 'apartment') as any;
        const property = {
          id: `mock-${mp.id}`,
          agentId: null,
          title: `Property #${mp.id}`,
          description: null,
          price: mp.price,
          currency: 'GEL',
          location,
          district,
          city,
          country: 'Georgia',
          propertyType,
          transactionType,
          bedrooms: mp.bedrooms,
          bathrooms: mp.bathrooms,
          area: mp.sqft,
          floor: mp.floor ?? null,
          totalFloors: null,
          constructionYear: mp.year ?? null,
          condition: 'good',
          furnished: 'furnished',
          amenities: mp.amenities ?? [],
          imageUrls: mp.images ?? [mp.image],
          latitude: null,
          longitude: null,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isFeatured: Boolean(mp.isNew),
          featuredUntil: null,
          viewsCount: 0,
        };
        return jsonResponse({ property, agent: null, analytics: null });
      }
    }

    const detail = await getPropertyDetail(id);
    if (!detail) {
      return jsonResponse(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Property not found',
          },
        },
        { status: 404 }
      );
    }

    return jsonResponse(detail);
  } catch (error) {
    return errorResponse(error);
  }
}
