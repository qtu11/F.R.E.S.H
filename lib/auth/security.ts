import { NextRequest } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';

export interface ClientIpInfo {
  ip: string;
  proxyChain: string;
  isSuspicious: boolean;
  userAgent: string;
}

/**
 * Trích xuất địa chỉ IP thực tế của client và phát hiện VPN, Proxy, Fake IP
 */
export function extractClientIp(req: Request | NextRequest): ClientIpInfo {
  const headers = req.headers;
  
  const userAgent = headers.get('user-agent') || 'Unknown';
  
  // Trích xuất các header IP phổ biến
  const xForwardedFor = headers.get('x-forwarded-for');
  const xRealIp = headers.get('x-real-ip');
  const cfConnectingIp = headers.get('cf-connecting-ip');
  const trueClientIp = headers.get('true-client-ip');
  
  let ip = '127.0.0.1';
  let proxyChain = '';
  let isSuspicious = false;
  
  if (xForwardedFor) {
    proxyChain = xForwardedFor;
    const ips = xForwardedFor.split(',').map(i => i.trim());
    // IP thực là IP đầu tiên trong chuỗi
    ip = ips[0];
    
    // Nếu chuỗi proxy có nhiều hơn 2 địa chỉ IP, có khả năng cao là đang dùng mạng ẩn danh, VPN hoặc Proxy nhiều lớp
    if (ips.length > 2) {
      isSuspicious = true;
    }
  } else if (cfConnectingIp) {
    ip = cfConnectingIp;
  } else if (trueClientIp) {
    ip = trueClientIp;
  } else if (xRealIp) {
    ip = xRealIp;
  }
  
  // Kiểm tra tính hợp lệ của IP
  if (ip === '::1' || ip === '0:0:0:0:0:0:0:1') {
    ip = '127.0.0.1';
  }
  
  // Kiểm tra dấu hiệu user-agent giả mạo hoặc bất thường phổ biến từ hacker (như curl, python-requests, bots)
  const suspiciousUserAgents = ['curl', 'wget', 'python', 'postman', 'headless', 'puppeteer', 'sqlmap', 'nmap'];
  if (suspiciousUserAgents.some(ua => userAgent.toLowerCase().includes(ua))) {
    isSuspicious = true;
  }
  
  return {
    ip,
    proxyChain,
    isSuspicious,
    userAgent
  };
}

/**
 * Ghi log truy cập và giám sát an ninh mạng
 */
export async function logSecurityEvent(
  req: Request | NextRequest,
  userId: string | null,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTimeMs: number
) {
  try {
    const supabase = getServerClient();
    if (!supabase) return;
    
    const { ip, proxyChain, isSuspicious, userAgent } = extractClientIp(req);
    
    await supabase.from('api_usage_logs').insert({
      endpoint,
      method,
      user_id: userId,
      status_code: statusCode,
      response_time_ms: responseTimeMs,
      ip_address: ip,
      user_agent: userAgent,
      is_suspicious: isSuspicious,
      proxy_chain: proxyChain || null,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Failed to log security event:', err);
  }
}
