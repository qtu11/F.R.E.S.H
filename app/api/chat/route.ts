import { NextResponse } from 'next/server';

const MODELS = [
  "nvidia/nemotron-3-super-120b-a12b:free",
  "openai/gpt-oss-120b:free",
  "deepseek/deepseek-v4-flash:free",
  "google/gemma-4-31b-it:free",
  "google/gemini-2.5-flash:free"
];

// System prompt theo ngon ngu
function getSystemPrompt(lang: string) {
  if (lang === 'en') {
    return `You are FRESH AI, an advanced virtual assistant for the FRESH Platform (Food Rescue, ESG, Smart Hyperlocal). Provide helpful, concise answers regarding food rescuing, green credits, ESG, and partner support. Be professional yet futuristic.

CRITICAL LANGUAGE RULE: You MUST reply ONLY in English. Do NOT use Chinese, Vietnamese, or any other language. Every single word of your response must be in English.

Behavior Rules:
- Always greet users in a friendly and polite manner.
- Do not use offensive, discriminatory, or unethical language.
- When you don't know the answer, honestly decline and direct users to contact support.
- Keep answers concise, focused, and directly addressing the user's question.

Support Rules:
- Provide accurate information about food rescue processes, ESG point exchanges, and green credits.
- Give step-by-step guidance for new partners joining the platform when requested.
- If users encounter system errors, ask for more details and report to the technical team.
- Help answer questions about FRESH Platform's privacy policy and terms of service.`;
  }

  return `You are FRESH AI, an advanced virtual assistant for the FRESH Platform (Food Rescue, ESG, Smart Hyperlocal). Provide helpful, concise answers regarding food rescuing, green credits, ESG, and partner support. Be professional yet futuristic.

QUY TAC NGON NGU BAT BUOC: Ban PHAI tra loi HOAN TOAN bang tieng Viet. TUYET DOI KHONG duoc su dung tieng Trung, tieng Anh, hay bat ky ngon ngu nao khac. Moi tu, moi cau trong cau tra loi cua ban deu phai la tieng Viet.

Quy tac ung xu (Behavior Rules):
- Luon chao hoi than thien va lich su.
- Tu dong tra loi bang tieng Viet.
- Khong su dung ngon tu xuc pham, phan biet doi xu hoac vi pham tieu chuan dao duc.
- Khi khong biet cau tra loi, hay trung thuc tu choi va huong dan nguoi dung lien he ho tro.
- Tra loi ngan gon, suc tich va tap trung vao dung trong tam cau hoi cua nguoi dung.

Quy tac ho tro (Support Rules):
- Cung cap thong tin chinh xac ve quy trinh giai cuu thuc pham, doi diem ESG, va tin chi xanh.
- Huong dan chi tiet tung buoc cho doi tac moi tham gia nen tang khi duoc yeu cau.
- Neu nguoi dung gap loi he thong, yeu cau ho cung cap them thong tin va bao cao cho doi ngu ky thuat.
- Ho tro giai dap cac thac mac ve chinh sach bao mat va dieu khoan su dung cua FRESH Platform.`;
}

export async function POST(req: Request) {
  try {
    const { messages, lang } = await req.json();

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenRouter API key is not configured" }, { status: 500 });
    }

    let response: Response | null = null;
    let lastErrorMsg = "";
    let activeModel = "";

    // Xac dinh ngon ngu de tao system prompt phu hop
    const userLang = lang || 'vi';
    const systemPrompt = getSystemPrompt(userLang);

    // Thu tuan tu tung model trong danh sach cho den khi ket noi thanh cong
    for (const model of MODELS) {
      try {
        console.log(`[FRESH AI Failover] Dang co gang ket noi voi model: ${model}...`);
        
        const payload = {
          model: model,
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            ...messages
          ],
          stream: true,
        };

        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
            'X-Title': 'F.R.E.S.H Platform',
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          response = res;
          activeModel = model;
          console.log(`[FRESH AI Failover] Ket noi thanh cong! Dang su dung model: ${model}`);
          break;
        } else {
          const errText = await res.text();
          console.warn(`[FRESH AI Failover] Model ${model} tra ve loi: ${res.status} - ${errText}`);
          lastErrorMsg = `Model ${model} failed with status ${res.status}`;
        }
      } catch (err: any) {
        console.warn(`[FRESH AI Failover] Khong the ket noi voi model ${model} do loi mang: ${err?.message || err}`);
        lastErrorMsg = err?.message || String(err);
      }
    }

    // Neu toan bo danh sach model deu that bai
    if (!response || !response.body) {
      console.error("[FRESH AI Failover] Tat ca cac model trong danh sach deu bi loi hoac het token!");
      return NextResponse.json({ 
        error: "All models failed or exhausted tokens", 
        details: lastErrorMsg 
      }, { status: 502 });
    }

    // Pass the stream directly to the client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Active-Model': activeModel
      },
    });

  } catch (error) {
    console.error("Chat API execution error:", error);
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 });
  }
}
