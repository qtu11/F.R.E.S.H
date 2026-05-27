import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { loadConfig, getConnectionString } from '@/lib/supabase/config';
import { requireRole } from '@/lib/auth/middleware';
import postgres from 'postgres';

// Cấu hình mặc định mở rộng
const DEFAULT_SETTINGS = {
  admin_bank: {
    banks: [
      {
        id: 'default-bank',
        bank_name: 'Vietcombank',
        account_number: '1234567890',
        account_holder: 'CONG TY F.R.E.S.H',
        branch: 'Chi nhánh TP.HCM',
        transfer_template: 'FRESH NAP {userId}',
        is_active: true
      }
    ]
  },
  notifications: {
    // Tích hợp nhiều công cụ thông báo động
    integrations: {
      telegram: {
        enabled: false,
        bot_token: '',
        chat_id: ''
      },
      zalo: {
        enabled: false,
        oa_id: '',
        access_token: ''
      },
      discord: {
        enabled: false,
        webhook_url: ''
      },
      slack: {
        enabled: false,
        webhook_url: ''
      },
      webhook: {
        enabled: false,
        url: '',
        secret_token: ''
      }
    }
  },
  ai_model: {
    // Model AI hoạt động hiện tại
    active_provider: 'gemini', // 'openai' | 'grok' | 'deepseek' | 'claude' | 'gemini' | 'kimi' | 'openrouter' | 'custom'
    
    // Cấu hình cụ thể từng model
    providers: {
      openai: {
        api_key: '',
        model_name: 'gpt-4o',
        endpoint: 'https://api.openai.com/v1'
      },
      grok: {
        api_key: '',
        model_name: 'grok-2-1212',
        endpoint: 'https://api.x.ai/v1'
      },
      deepseek: {
        api_key: '',
        model_name: 'deepseek-chat',
        endpoint: 'https://api.deepseek.com/v1'
      },
      claude: {
        api_key: '',
        model_name: 'claude-3-5-sonnet-latest',
        endpoint: 'https://api.anthropic.com/v1'
      },
      gemini: {
        api_key: '',
        model_name: 'gemini-1.5-pro',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta'
      },
      kimi: {
        api_key: '',
        model_name: 'moonshot-v1-8k',
        endpoint: 'https://api.moonshot.cn/v1'
      },
      openrouter: {
        api_key: '',
        model_name: 'google/gemini-2.5-flash',
        endpoint: 'https://openrouter.ai/api/v1'
      },
      custom: {
        api_key: '',
        model_name: 'custom-model-id',
        endpoint: 'https://your-custom-endpoint/v1'
      }
    },
    // Tham số chung
    temperature: 0.7,
    max_tokens: 1000
  },
  esg_config: {
    co2_conversion_rate: 3.6,
    points_conversion_rate: 1000,
    tier_thresholds: {
      dong: 100,
      bac: 500,
      vang: 2000,
      kimcuong: 5000
    },
    green_fund_rate: 1.5,
    green_fund_partner: 'GreenViet'
  },
  billing_config: {
    partner_commission_rate: 10,
    service_fee: 2000,
    min_withdrawal_limit: 200000,
    auto_payout_enabled: false,
    auto_payout_threshold: 5000000
  },
  security_config: {
    enable_anti_fraud: true,
    risk_alert_threshold: 75,
    require_biometric_limit: 500000,
    session_timeout_days: 15,
    enable_ip_whitelist: false,
    ip_whitelist: ''
  }
};

async function getDbClient() {
  const config = loadConfig();
  const connStr = getConnectionString(config);
  if (!connStr) return null;
  return postgres(connStr, { max: 1 });
}

export async function GET() {
  let sql: postgres.Sql | null = null;
  try {
    const auth = await requireRole('admin');
    if ('status' in auth) return auth;

    sql = await getDbClient();
    if (!sql) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });

    // 1. Tự động tạo bảng nếu chưa tồn tại
    await sql`
      CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 2. Lấy toàn bộ cấu hình
    const rows = await sql`SELECT key, value FROM system_settings`;
    const settingsMap = new Map<string, any>();
    rows.forEach(r => settingsMap.set(r.key, r.value));

    // 3. Đảm bảo có đầy đủ cấu hình và tương thích ngược
    const responseData: Record<string, any> = {};
    for (const [key, defaultValue] of Object.entries(DEFAULT_SETTINGS)) {
      if (!settingsMap.has(key)) {
        // Chèn cấu hình mặc định mới nếu chưa có
        await sql`
          INSERT INTO system_settings (key, value)
          VALUES (${key}, ${sql.json(defaultValue)})
          ON CONFLICT (key) DO NOTHING
        `;
        responseData[key] = defaultValue;
      } else {
        const storedValue = settingsMap.get(key);
        
        // --- XỬ LÝ TƯƠNG THÍCH NGƯỢC ---
        if (key === 'admin_bank') {
          // Nếu dữ liệu cũ là 1 bank đơn lẻ
          if (!storedValue.banks) {
            responseData[key] = {
              banks: [
                {
                  id: 'default-bank',
                  bank_name: storedValue.bank_name || 'Vietcombank',
                  account_number: storedValue.account_number || '',
                  account_holder: storedValue.account_holder || '',
                  branch: storedValue.branch || '',
                  transfer_template: storedValue.transfer_template || 'FRESH NAP {userId}',
                  is_active: true
                }
              ]
            };
          } else {
            responseData[key] = storedValue;
          }
        } else if (key === 'notifications') {
          // Nếu dữ liệu cũ thiếu mục integrations động
          if (!storedValue.integrations) {
            responseData[key] = {
              integrations: {
                telegram: {
                  enabled: storedValue.enable_telegram || false,
                  bot_token: storedValue.telegram_bot_token || '',
                  chat_id: storedValue.telegram_chat_id || ''
                },
                zalo: {
                  enabled: storedValue.enable_zalo || false,
                  oa_id: storedValue.zalo_oa_id || '',
                  access_token: storedValue.zalo_access_token || ''
                },
                discord: {
                  enabled: false,
                  webhook_url: ''
                },
                slack: {
                  enabled: false,
                  webhook_url: ''
                },
                webhook: {
                  enabled: false,
                  url: '',
                  secret_token: ''
                }
              }
            };
          } else {
            responseData[key] = storedValue;
          }
        } else if (key === 'ai_model') {
          // Nếu dữ liệu cũ thiếu providers động
          if (!storedValue.providers) {
            const defaultAI = JSON.parse(JSON.stringify(DEFAULT_SETTINGS.ai_model));
            // Cập nhật API Key cũ vào mục openrouter tương ứng
            if (storedValue.openrouter_api_key) {
              defaultAI.providers.openrouter.api_key = storedValue.openrouter_api_key;
            }
            if (storedValue.model_name) {
              defaultAI.providers.openrouter.model_name = storedValue.model_name;
            }
            defaultAI.temperature = storedValue.temperature !== undefined ? storedValue.temperature : 0.7;
            defaultAI.max_tokens = storedValue.max_tokens !== undefined ? storedValue.max_tokens : 1000;
            defaultAI.active_provider = 'openrouter';
            responseData[key] = defaultAI;
          } else {
            responseData[key] = storedValue;
          }
        } else {
          responseData[key] = storedValue;
        }
      }
    }

    return NextResponse.json({ success: true, settings: responseData });
  } catch (err: any) {
    console.error('GET admin settings error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  } finally {
    if (sql) await sql.end();
  }
}

export async function POST(req: Request) {
  let sql: postgres.Sql | null = null;
  try {
    const auth = await requireRole('admin');
    if ('status' in auth) return auth;

    const body = await req.json();
    const { key, value } = body;

    if (!key || !value) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }

    if (!Object.keys(DEFAULT_SETTINGS).includes(key)) {
      return NextResponse.json({ error: 'Invalid settings key' }, { status: 400 });
    }

    sql = await getDbClient();
    if (!sql) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });

    // Cập nhật hoặc chèn cấu hình
    await sql`
      INSERT INTO system_settings (key, value, updated_at)
      VALUES (${key}, ${sql.json(value)}, CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
    `;

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (err: any) {
    console.error('POST admin settings error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  } finally {
    if (sql) await sql.end();
  }
}
