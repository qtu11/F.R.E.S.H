-- F.R.E.S.H. B2B Partner KYB Schema (Đã đồng bộ kiểu TEXT theo DB hiện tại)

-- 1. Bảng Organizations (Các tập đoàn lớn: Big C, Co.opmart, Mega Market)
CREATE TABLE IF NOT EXISTS public.organizations (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text, -- Đồng bộ về kiểu text
  name text NOT NULL,
  tax_code text UNIQUE,
  address text,
  phone text,
  email text,
  website text,
  logo text,
  description text,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'suspended'::text])),
  rejection_reason text,
  owner_id text REFERENCES public.users(id) ON DELETE SET NULL, -- Khớp với users(id) kiểu text
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  approved_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone
);

-- 2. Bảng Organization Members (Nhân sự thuộc siêu thị/đối tác)
CREATE TABLE IF NOT EXISTS public.organization_members (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id text NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, -- Khớp với users(id) kiểu text
  role text NOT NULL DEFAULT 'staff'::text CHECK (role = ANY (ARRAY['admin'::text, 'manager'::text, 'accountant'::text, 'staff'::text])),
  invited_by text REFERENCES public.users(id) ON DELETE SET NULL,
  invited_at timestamp with time zone,
  joined_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['invited'::text, 'active'::text, 'disabled'::text])),
  permissions jsonb DEFAULT '[]'::jsonb,
  UNIQUE(organization_id, user_id)
);

-- 3. Bảng Partner Legal Documents (Hồ sơ pháp lý phục vụ thẩm định KYB)
CREATE TABLE IF NOT EXISTS public.partner_documents (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id text NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type = ANY (ARRAY['business_license'::text, 'tax_certificate'::text, 'authorization_letter'::text, 'contract'::text, 'other'::text])),
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size integer DEFAULT 0,
  mime_type text,
  uploaded_by text REFERENCES public.users(id) ON DELETE SET NULL,
  uploaded_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  verified_by text REFERENCES public.users(id) ON DELETE SET NULL,
  verified_at timestamp with time zone,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'verified'::text, 'rejected'::text])),
  rejection_reason text
);

-- 4. Bảng Organization Branches (Cấu hình các chi nhánh/kho của siêu thị)
CREATE TABLE IF NOT EXISTS public.organization_branches (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id text NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  store_id text REFERENCES public.stores(id) ON DELETE SET NULL, -- Nối chuẩn xác sang public.stores(id) kiểu text
  name text NOT NULL,
  address text,
  phone text,
  manager_id text REFERENCES public.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text])),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Thêm cột organization_id vào bảng users hiện tại của bạn
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS organization_id text REFERENCES public.organizations(id) ON DELETE SET NULL;

---
-- KÍCH HOẠT HỆ THỐNG BẢO MẬT ROW LEVEL SECURITY (RLS)
---
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_branches ENABLE ROW LEVEL SECURITY;

---
-- ĐỊNH NGHĨA CÁC CHÍNH SÁCH BẢO MẬT (RLS POLICIES)
-- Điểm cốt lõi: Ép kiểu auth.uid()::text để so khớp mượt mà với cột text của bạn
---

-- Quyền xem/sửa trên bảng Organizations
CREATE POLICY org_select_own ON public.organizations FOR SELECT
  USING (
    id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()::text)
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY org_update_admin ON public.organizations FOR UPDATE
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Quyền trên bảng Organization Members
CREATE POLICY om_select_own ON public.organization_members FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()::text)
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Quyền trên bảng Partner Documents
CREATE POLICY pd_select_own ON public.partner_documents FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()::text)
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Quyền trên bảng Organization Branches
CREATE POLICY ob_select_own ON public.organization_branches FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()::text)
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

---
-- TẠO INDEXES ĐỂ TỐI ƯU TỐC ĐỘ TRUY VẤN
---
CREATE INDEX IF NOT EXISTS idx_organization_members_org ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_documents_org ON public.partner_documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_branches_org ON public.organization_branches(organization_id);