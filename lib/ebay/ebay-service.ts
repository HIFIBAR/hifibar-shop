import { supabase } from '@/lib/supabase';

export interface EbaySettings {
  id?: string;
  ebay_app_id: string;
  ebay_cert_id: string;
  ebay_dev_id: string;
  ebay_oauth_token: string;
  ebay_refresh_token: string;
  ebay_site_id: string;
  sync_enabled: boolean;
  last_sync_at?: string;
}

export interface EbayListing {
  listingId: string;
  sku?: string;
  title: string;
  price: number;
  quantity: number;
  imageUrls: string[];
  itemSpecifics?: Record<string, string>;
  condition?: string;
  mpn?: string;
  brand?: string;
  model?: string;
  rawData: any;
}

export class EbayService {
  private settings: EbaySettings | null = null;
  private baseUrl = 'https://api.ebay.com';

  async getSettings(): Promise<EbaySettings | null> {
    try {
      const { data, error } = await supabase
        .from('ebay_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      this.settings = data;
      return data;
    } catch (error) {
      console.error('Error loading eBay settings:', error);
      return null;
    }
  }

  async fetchAllActiveListings(): Promise<EbayListing[]> {
    const settings = await this.getSettings();
    if (!settings || !settings.ebay_oauth_token) {
      throw new Error('eBay not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/sell/inventory/v1/inventory_item?limit=100`, {
        headers: {
          'Authorization': `Bearer ${settings.ebay_oauth_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`eBay API error: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      const listings: EbayListing[] = [];

      if (data.inventoryItems && Array.isArray(data.inventoryItems)) {
        for (const item of data.inventoryItems) {
          const offerResponse = await fetch(
            `${this.baseUrl}/sell/inventory/v1/offer?sku=${item.sku}`,
            {
              headers: {
                'Authorization': `Bearer ${settings.ebay_oauth_token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          let price = 0;
          let listingId = '';

          if (offerResponse.ok) {
            const offerData = await offerResponse.json();
            if (offerData.offers && offerData.offers.length > 0) {
              const offer = offerData.offers[0];
              price = parseFloat(offer.pricingSummary?.price?.value || '0');
              listingId = offer.listingId || '';
            }
          }

          const itemSpecifics: Record<string, string> = {};
          if (item.product?.aspects) {
            for (const [key, values] of Object.entries(item.product.aspects)) {
              if (Array.isArray(values) && values.length > 0) {
                itemSpecifics[key] = values[0];
              }
            }
          }

          listings.push({
            listingId: listingId,
            sku: item.sku,
            title: item.product?.title || '',
            price: price,
            quantity: item.availability?.shipToLocationAvailability?.quantity || 0,
            imageUrls: item.product?.imageUrls || [],
            itemSpecifics: itemSpecifics,
            condition: item.condition,
            mpn: itemSpecifics['MPN'] || itemSpecifics['Numéro de pièce fabricant'],
            brand: itemSpecifics['Brand'] || itemSpecifics['Marque'],
            model: itemSpecifics['Model'] || itemSpecifics['Modèle'],
            rawData: item,
          });
        }
      }

      return listings;
    } catch (error: any) {
      console.error('Error fetching eBay listings:', error);
      throw error;
    }
  }

  async mapListingToProduct(listing: EbayListing): Promise<any> {
    const codeMatch = listing.title.match(/MSA\d+/i);
    const code = codeMatch ? codeMatch[0] : listing.sku || '';

    return {
      ebay_id: listing.listingId,
      ebay_sku: listing.sku || '',
      ebay_title: listing.title,
      ebay_url: listing.listingId ? `https://www.ebay.fr/itm/${listing.listingId}` : '',
      ebay_raw_data: listing.rawData,
      code: code,
      marque_tv: listing.brand || '',
      modele_tv: listing.model || '',
      num1: listing.mpn || '',
      num2: listing.itemSpecifics?.['Numéro de pièce 2'] || '',
      prix: listing.price,
      stock_qty: listing.quantity,
      etat_piece: listing.condition === 'NEW' ? 'A' : 'B',
      images: listing.imageUrls.slice(0, 5),
      last_ebay_sync: new Date().toISOString(),
    };
  }

  async syncListingToDatabase(listing: EbayListing): Promise<{ action: 'created' | 'updated', productId: string }> {
    const mappedProduct = await this.mapListingToProduct(listing);

    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .or(`ebay_id.eq.${listing.listingId},ebay_sku.eq.${listing.sku}`)
      .maybeSingle();

    if (existingProduct) {
      await supabase
        .from('products')
        .update({
          prix: mappedProduct.prix,
          stock_qty: mappedProduct.stock_qty,
          ebay_title: mappedProduct.ebay_title,
          ebay_url: mappedProduct.ebay_url,
          ebay_raw_data: mappedProduct.ebay_raw_data,
          images: mappedProduct.images,
          last_ebay_sync: mappedProduct.last_ebay_sync,
        })
        .eq('id', existingProduct.id);

      return { action: 'updated', productId: existingProduct.id };
    } else {
      const { data: newProduct, error } = await supabase
        .from('products')
        .insert(mappedProduct)
        .select('id')
        .single();

      if (error) throw error;

      return { action: 'created', productId: newProduct.id };
    }
  }

  async syncAll(): Promise<{
    success: boolean;
    itemsFetched: number;
    itemsCreated: number;
    itemsUpdated: number;
    errors: string[];
  }> {
    const syncStarted = new Date().toISOString();
    let itemsFetched = 0;
    let itemsCreated = 0;
    let itemsUpdated = 0;
    const errors: string[] = [];

    const { data: logEntry } = await supabase
      .from('ebay_sync_logs')
      .insert({
        sync_started_at: syncStarted,
        status: 'running',
      })
      .select('id')
      .single();

    try {
      const listings = await this.fetchAllActiveListings();
      itemsFetched = listings.length;

      for (const listing of listings) {
        try {
          const result = await this.syncListingToDatabase(listing);
          if (result.action === 'created') {
            itemsCreated++;
          } else {
            itemsUpdated++;
          }
        } catch (error: any) {
          errors.push(`Error syncing ${listing.sku}: ${error.message}`);
        }
      }

      const status = errors.length === 0 ? 'success' : errors.length < itemsFetched ? 'partial' : 'failed';

      if (logEntry) {
        await supabase
          .from('ebay_sync_logs')
          .update({
            sync_completed_at: new Date().toISOString(),
            status: status,
            items_fetched: itemsFetched,
            items_created: itemsCreated,
            items_updated: itemsUpdated,
            errors: errors,
          })
          .eq('id', logEntry.id);
      }

      await supabase
        .from('ebay_settings')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', (await this.getSettings())?.id || '');

      return {
        success: status === 'success',
        itemsFetched,
        itemsCreated,
        itemsUpdated,
        errors,
      };
    } catch (error: any) {
      if (logEntry) {
        await supabase
          .from('ebay_sync_logs')
          .update({
            sync_completed_at: new Date().toISOString(),
            status: 'failed',
            errors: [error.message],
          })
          .eq('id', logEntry.id);
      }

      return {
        success: false,
        itemsFetched: 0,
        itemsCreated: 0,
        itemsUpdated: 0,
        errors: [error.message],
      };
    }
  }
}

export const ebayService = new EbayService();
