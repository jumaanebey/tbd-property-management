import { createClient } from '@supabase/supabase-js';

// Database schema for tenant portal
export interface Tenant {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  unit_id: string;
  lease_start: string;
  lease_end: string;
  rent_amount: number;
  security_deposit: number;
  status: 'active' | 'inactive' | 'pending';
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: string;
  property_id: string;
  unit_number: string;
  floor: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  rent_amount: number;
  status: 'occupied' | 'vacant' | 'maintenance';
  amenities: string[];
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  property_type: 'apartment' | 'house' | 'condo';
  total_units: number;
  amenities: string[];
  manager_id: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  tenant_id: string;
  amount: number;
  due_date: string;
  status: 'paid' | 'pending' | 'overdue' | 'partial';
  paid_date?: string;
  payment_method?: 'online' | 'check' | 'cash' | 'bank_transfer';
  transaction_id?: string;
  late_fees?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRequest {
  id: string;
  tenant_id: string;
  unit_id: string;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'pest' | 'other';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: string;
  estimated_completion?: string;
  actual_completion?: string;
  cost?: number;
  photos?: string[];
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  tenant_id: string;
  title: string;
  type: 'lease' | 'notice' | 'receipt' | 'maintenance' | 'other';
  file_url: string;
  file_size: number;
  mime_type: string;
  status: 'active' | 'archived';
  expires_at?: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  tenant_id: string;
  title: string;
  message: string;
  type: 'payment' | 'maintenance' | 'document' | 'general' | 'emergency';
  read: boolean;
  action_url?: string;
  created_at: string;
}

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database operations
export class TenantPortalDB {
  // Tenant operations
  static async getTenant(userId: string): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from('tenants')
      .select(`
        *,
        units (*),
        properties (*)
      `)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching tenant:', error);
      return null;
    }

    return data;
  }

  static async updateTenantProfile(userId: string, updates: Partial<Tenant>): Promise<boolean> {
    const { error } = await supabase
      .from('tenants')
      .update(updates)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating tenant profile:', error);
      return false;
    }

    return true;
  }

  // Payment operations
  static async getPayments(tenantId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('due_date', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
      return [];
    }

    return data || [];
  }

  static async createPayment(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .insert([payment])
      .select()
      .single();

    if (error) {
      console.error('Error creating payment:', error);
      return null;
    }

    return data;
  }

  static async updatePaymentStatus(paymentId: string, status: Payment['status'], paidDate?: string): Promise<boolean> {
    const updates: Partial<Payment> = { status };
    if (paidDate) updates.paid_date = paidDate;

    const { error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', paymentId);

    if (error) {
      console.error('Error updating payment:', error);
      return false;
    }

    return true;
  }

  // Maintenance operations
  static async getMaintenanceRequests(tenantId: string): Promise<MaintenanceRequest[]> {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching maintenance requests:', error);
      return [];
    }

    return data || [];
  }

  static async createMaintenanceRequest(request: Omit<MaintenanceRequest, 'id' | 'created_at' | 'updated_at'>): Promise<MaintenanceRequest | null> {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .insert([request])
      .select()
      .single();

    if (error) {
      console.error('Error creating maintenance request:', error);
      return null;
    }

    return data;
  }

  static async updateMaintenanceRequest(requestId: string, updates: Partial<MaintenanceRequest>): Promise<boolean> {
    const { error } = await supabase
      .from('maintenance_requests')
      .update(updates)
      .eq('id', requestId);

    if (error) {
      console.error('Error updating maintenance request:', error);
      return false;
    }

    return true;
  }

  // Document operations
  static async getDocuments(tenantId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }

    return data || [];
  }

  static async uploadDocument(document: Omit<Document, 'id' | 'created_at' | 'updated_at'>): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .insert([document])
      .select()
      .single();

    if (error) {
      console.error('Error uploading document:', error);
      return null;
    }

    return data;
  }

  // Notification operations
  static async getNotifications(tenantId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data || [];
  }

  static async markNotificationAsRead(notificationId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }

    return true;
  }

  // File upload operations
  static async uploadFile(file: File, path: string): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error } = await supabase.storage
      .from('tenant-documents')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    const { data } = supabase.storage
      .from('tenant-documents')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  // Analytics and reporting
  static async getPaymentHistory(tenantId: string, months: number = 12): Promise<Payment[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }

    return data || [];
  }

  static async getMaintenanceStats(tenantId: string): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    averageResolutionTime: number;
  }> {
    const requests = await this.getMaintenanceRequests(tenantId);
    
    const stats = {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      inProgress: requests.filter(r => r.status === 'in_progress').length,
      completed: requests.filter(r => r.status === 'completed').length,
      averageResolutionTime: 0
    };

    const completedRequests = requests.filter(r => r.status === 'completed' && r.actual_completion);
    if (completedRequests.length > 0) {
      const totalDays = completedRequests.reduce((sum, req) => {
        const created = new Date(req.created_at);
        const completed = new Date(req.actual_completion!);
        return sum + (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      }, 0);
      stats.averageResolutionTime = Math.round(totalDays / completedRequests.length);
    }

    return stats;
  }
}

// Mock data for development (when Supabase is not configured)
export const mockData = {
  tenant: {
    id: '1',
    user_id: 'john_smith',
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    unit_id: 'unit_1',
    lease_start: '2024-01-01',
    lease_end: '2024-12-31',
    rent_amount: 4200,
    security_deposit: 4200,
    status: 'active' as const,
    emergency_contact_name: 'Jane Smith',
    emergency_contact_phone: '(555) 987-6543',
    emergency_contact_relationship: 'Spouse',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  payments: [
    {
      id: '1',
      tenant_id: '1',
      amount: 4200,
      due_date: '2024-01-01',
      status: 'paid' as const,
      paid_date: '2024-01-01',
      payment_method: 'online' as const,
      transaction_id: 'txn_123',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      tenant_id: '1',
      amount: 4200,
      due_date: '2024-02-01',
      status: 'pending' as const,
      created_at: '2024-02-01T00:00:00Z',
      updated_at: '2024-02-01T00:00:00Z'
    }
  ],
  maintenanceRequests: [
    {
      id: '1',
      tenant_id: '1',
      unit_id: 'unit_1',
      title: 'Kitchen Sink Leak',
      description: 'Small leak under the kitchen sink, water pooling in cabinet',
      category: 'plumbing' as const,
      priority: 'medium' as const,
      status: 'in_progress' as const,
      estimated_completion: '2024-01-20',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    }
  ],
  documents: [
    {
      id: '1',
      tenant_id: '1',
      title: 'Lease Agreement',
      type: 'lease' as const,
      file_url: '/documents/lease.pdf',
      file_size: 1024000,
      mime_type: 'application/pdf',
      status: 'active' as const,
      uploaded_by: 'property_manager',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ]
}; 