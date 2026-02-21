import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { errorResponse, jsonResponse, requireUser } from '../../utils';

const updateSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'VIEWING_SCHEDULED', 'NEGOTIATING', 'CLOSED_WON', 'CLOSED_LOST']).optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
});

// PATCH /api/inquiries/[id] — Update inquiry (agent/admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireUser(request, ['agent', 'admin']);

    const { id } = params;
    const body = await request.json();
    const payload = updateSchema.parse(body);

    // Check if inquiry exists
    const existingInquiry = await prisma.inquiry.findUnique({
      where: { id },
    });

    if (!existingInquiry) {
      return jsonResponse({ error: 'Inquiry not found' }, { status: 404 });
    }

    // Update inquiry
    const updatedInquiry = await prisma.inquiry.update({
      where: { id },
      data: {
        ...payload,
        updatedAt: new Date(),
      },
    });

    return jsonResponse(updatedInquiry);
  } catch (error) {
    return errorResponse(error);
  }
}

// DELETE /api/inquiries/[id] — Delete inquiry (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireUser(request, ['admin']);

    const { id } = params;

    // Check if inquiry exists
    const existingInquiry = await prisma.inquiry.findUnique({
      where: { id },
    });

    if (!existingInquiry) {
      return jsonResponse({ error: 'Inquiry not found' }, { status: 404 });
    }

    // Delete inquiry
    await prisma.inquiry.delete({
      where: { id },
    });

    return jsonResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}

// GET /api/inquiries/[id] — Get single inquiry (agent/admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireUser(request, ['agent', 'admin']);

    const { id } = params;

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!inquiry) {
      return jsonResponse({ error: 'Inquiry not found' }, { status: 404 });
    }

    return jsonResponse(inquiry);
  } catch (error) {
    return errorResponse(error);
  }
}
