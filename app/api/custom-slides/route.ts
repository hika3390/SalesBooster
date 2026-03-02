import { NextRequest } from 'next/server';
import { customSlideController } from '@/server/controllers/customSlideController';

export async function GET(request: NextRequest) {
  return customSlideController.getCustomSlides(request);
}

export async function POST(request: NextRequest) {
  return customSlideController.createCustomSlide(request);
}
