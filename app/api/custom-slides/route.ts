import { NextRequest } from 'next/server';
import { customSlideController } from '@/server/controllers/customSlideController';

export async function GET() {
  return customSlideController.getCustomSlides();
}

export async function POST(request: NextRequest) {
  return customSlideController.createCustomSlide(request);
}
