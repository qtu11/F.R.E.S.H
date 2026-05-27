export type OrganizationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type MemberRole = 'admin' | 'manager' | 'accountant' | 'staff';
export type MemberStatus = 'invited' | 'active' | 'disabled';
export type DocumentType = 'business_license' | 'tax_certificate' | 'authorization_letter' | 'contract' | 'other';
export type DocumentStatus = 'pending' | 'verified' | 'rejected';

export interface Organization {
  id: string;
  name: string;
  taxCode?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  description?: string;
  status: OrganizationStatus;
  rejectionReason?: string;
  ownerId?: string;
  createdAt: string;
  approvedAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: MemberRole;
  invitedBy?: string;
  invitedAt?: string;
  joinedAt?: string;
  status: MemberStatus;
  permissions: string[];
}

export interface PartnerDocument {
  id: string;
  organizationId: string;
  type: DocumentType;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType?: string;
  uploadedBy?: string;
  uploadedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  status: DocumentStatus;
  rejectionReason?: string;
}

export interface OrganizationBranch {
  id: string;
  organizationId: string;
  storeId?: string;
  name: string;
  address?: string;
  phone?: string;
  managerId?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  name: string;
  phone: string;
  organizationName: string;
  taxCode: string;
  address: string;
}

async function api(path: string, options?: RequestInit) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return res.json();
}

export const partnerService = {
  async register(data: RegistrationData): Promise<{ organization: Organization; user: any; token: string }> {
    return api('/partners/register', { method: 'POST', body: JSON.stringify(data) });
  },

  async getOrganization(): Promise<Organization | null> {
    return api('/organizations/mine');
  },

  async getAllOrganizations(): Promise<Organization[]> {
    return api('/organizations');
  },

  async getOrganizationById(id: string): Promise<Organization> {
    return api(`/organizations/${id}`);
  },

  async getOrganizationDocuments(): Promise<PartnerDocument[]> {
    return api('/organizations/documents');
  },

  async uploadDocument(formData: FormData): Promise<PartnerDocument> {
    const res = await fetch('/api/organizations/documents/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }
    return res.json();
  },

  async updateOrganizationStatus(id: string, status: OrganizationStatus, rejectionReason?: string): Promise<Organization> {
    return api(`/organizations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rejectionReason }),
    });
  },

  async getOrganizationBranches(): Promise<OrganizationBranch[]> {
    return api('/organizations/branches');
  },

  async createBranch(data: Partial<OrganizationBranch>): Promise<OrganizationBranch> {
    return api('/organizations/branches', { method: 'POST', body: JSON.stringify(data) });
  },

  async inviteMember(organizationId: string, email: string, role: MemberRole): Promise<OrganizationMember> {
    return api('/organizations/members/invite', {
      method: 'POST',
      body: JSON.stringify({ organizationId, email, role }),
    });
  },
};
