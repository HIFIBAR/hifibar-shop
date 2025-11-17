import { NextRequest, NextResponse } from 'next/server';
import { ebayService } from '@/lib/ebay/ebay-service';

export async function POST(request: NextRequest) {
  try {
    const result = await ebayService.syncAll();

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('eBay sync error:', error);
    return NextResponse.json(
      {
        success: false,
        itemsFetched: 0,
        itemsCreated: 0,
        itemsUpdated: 0,
        errors: [error.message || 'Sync failed'],
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
