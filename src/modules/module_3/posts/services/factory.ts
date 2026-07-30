import { PostService } from './types';
import { MockPostService } from './mock-service';
import { SupabasePostService } from './supabase-service';

export type ServiceType = 'mock' | 'supabase';

export class PostServiceFactory {
  static getService(): PostService {
    const serviceType = process.env.NEXT_PUBLIC_SERVICE_TYPE || 'mock';
    const hasSupabaseCredentials = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (serviceType === 'supabase' && hasSupabaseCredentials) {
      return SupabasePostService.getInstance();
    }
    
    return MockPostService.getInstance();
  }
}
