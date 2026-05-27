import { NextResponse } from 'next/server';

const MODELS = [
  "nvidia/nemotron-3-super-120b-a12b:free",
  "openai/gpt-oss-120b:free",
  "z-ai/glm-4.5-air:free",
  "deepseek/deepseek-v4-flash:free",
  "google/gemma-4-31b-it:free",
  "google/gemini-2.5-flash:free"
];

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenRouter API key is not configured" }, { status: 500 });
    }

    let response: Response | null = null;
    let lastErrorMsg = "";
    let activeModel = "";

    // Thử tuần tự từng model trong danh sách cho đến khi kết nối thành công
    for (const model of MODELS) {
      try {
        console.log(`[FRESH AI Failover] Đang cố gắng kết nối với model: ${model}...`);
        
        const payload = {
          model: model,
          messages: [
            {
              role: "system",
              content: `You are FRESH AI, an advanced virtual assistant for the FRESH Platform (Food Rescue, ESG, Smart Hyperlocal). Provide helpful, concise answers regarding food rescuing, green credits, ESG, and partner support. Be professional yet futuristic.

Quy tắc ứng xử (Behavior Rules):
- Luôn chào hỏi thân thiện và lịch sự.
- Tự động nhận diện ngôn ngữ của người dùng (tiếng Việt, tiếng Anh, v.v.) và trả lời bằng chính ngôn ngữ đó.
- Không sử dụng ngôn từ xúc phạm, phân biệt đối xử hoặc vi phạm tiêu chuẩn đạo đức.
- Khi không biết câu trả lời, hãy trung thực từ chối và hướng dẫn người dùng liên hệ hỗ trợ.
- Trả lời ngắn gọn, súc tích và tập trung vào đúng trọng tâm câu hỏi của người dùng.

Quy tắc hỗ trợ (Support Rules):
- Cung cấp thông tin chính xác về quy trình giải cứu thực phẩm, đổi điểm ESG, và tín chỉ xanh.
- Hướng dẫn chi tiết từng bước cho đối tác mới tham gia nền tảng khi được yêu cầu.
- Nếu người dùng gặp lỗi hệ thống, yêu cầu họ cung cấp thêm thông tin và báo cáo cho đội ngũ kỹ thuật.
- Hỗ trợ giải đáp các thắc mắc về chính sách bảo mật và điều khoản sử dụng của FRESH Platform.`
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
          console.log(`[FRESH AI Failover] Kết nối thành công! Đang sử dụng model: ${model}`);
          break; // Tìm thấy model hoạt động tốt, dừng thử nghiệm
        } else {
          const errText = await res.text();
          console.warn(`[FRESH AI Failover] Model ${model} trả về lỗi: ${res.status} - ${errText}`);
          lastErrorMsg = `Model ${model} failed with status ${res.status}`;
        }
      } catch (err: any) {
        console.warn(`[FRESH AI Failover] Không thể kết nối với model ${model} do lỗi mạng: ${err?.message || err}`);
        lastErrorMsg = err?.message || String(err);
      }
    }

    // Nếu toàn bộ danh sách model đều thất bại
    if (!response || !response.body) {
      console.error("[FRESH AI Failover] Tất cả các model trong danh sách đều bị lỗi hoặc hết token!");
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
        'X-Active-Model': activeModel // Trả về header báo cho client biết model nào đang hoạt động
      },
    });

  } catch (error) {
    console.error("Chat API execution error:", error);
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 });
  }
}
