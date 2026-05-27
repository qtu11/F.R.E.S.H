import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'config', 'supabase.json');

export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  serviceRoleKey: string;
  dbPassword: string;
  configured: boolean;
}

export function loadConfig(): SupabaseConfig {
  const envConfig: SupabaseConfig = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    dbPassword: process.env.SUPABASE_DB_PASSWORD || '',
    configured: false,
  };

  if (envConfig.supabaseUrl && envConfig.supabaseAnonKey) {
    envConfig.configured = true;
    return envConfig;
  }

  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
      const fileConfig = JSON.parse(raw) as SupabaseConfig;
      return {
        supabaseUrl: fileConfig.supabaseUrl || envConfig.supabaseUrl,
        supabaseAnonKey: fileConfig.supabaseAnonKey || envConfig.supabaseAnonKey,
        serviceRoleKey: fileConfig.serviceRoleKey || envConfig.serviceRoleKey,
        dbPassword: fileConfig.dbPassword || envConfig.dbPassword,
        configured: !!(fileConfig.supabaseUrl && fileConfig.supabaseAnonKey),
      };
    }
  } catch {}

  return envConfig;
}

export function getProjectRef(url: string): string {
  const match = url.match(/https?:\/\/([^.]+)\./);
  return match ? match[1] : '';
}

export function saveConfig(input: Partial<SupabaseConfig>): SupabaseConfig {
  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const existing = loadConfig();
    const merged = { ...existing, ...input, configured: true };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2));
    return merged;
  } catch {
    return { ...loadConfig(), ...input, configured: false };
  }
}

export function getConnectionString(config: SupabaseConfig): string {
  const ref = getProjectRef(config.supabaseUrl);
  if (!ref || !config.dbPassword) return '';
  // Sử dụng transaction pooler (IPv4) của Supabase tại aws-1-ap-southeast-1.pooler.supabase.com vì kết nối trực tiếp db.ktnhoiqqecygxztsugkx.supabase.co dùng IPv6-only có thể không khả dụng trên môi trường hiện tại
  return `postgresql://postgres.${ref}:${encodeURIComponent(config.dbPassword)}@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require`;
}

