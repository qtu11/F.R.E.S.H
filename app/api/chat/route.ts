import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "YOUR_OPENROUTER_API_KEY_HERE";
    if (!apiKey) {
      return NextResponse.json({ error: "OpenRouter API key is missing" }, { status: 500 });
    }

    const payload = {
      model: "google/gemini-2.0-flash-exp:free",
      messages: [
        {
          role: "system",
          content: `You are FRESH AI, an advanced virtual assistant for the FRESH Platform (Food Rescue, ESG, Smart Hyperlocal). Provide helpful, concise answers regarding food rescuing, green credits, ESG, and partner support. Be professional yet futuristic.

Quy tắc ứng xử (Behavior Rules):
- Luôn chào hỏi thân thiện và lịch sự.
- Luôn sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, tự nhiên và dễ hiểu.
- Không sử dụng ngôn từ xúc phạm, phân biệt đối xử hoặc vi phạm tiêu chuẩn đạo đức.
- Khi không biết câu trả lời, hãy trung thực từ chối và hướng dẫn người dùng liên hệ hỗ trợ.
- Trả lời ngắn gọn, súc tích và tập trung vào đúng trọng tâm câu hỏi của người dùng.

Quy tắc hỗ trợ (Support Rules):
- Cung cấp thông tin chính xác về quy trình giải cứu thực phẩm, đổi điểm ESG, và tín chỉ xanh.
- Hướng dẫn chi tiết từng bước cho đối tác mới tham gia nền tảng khi được yêu cầu.
- Nếu người dùng gặp lỗi hệ thống, yêu cầu họ cung cấp thêm thông tin và báo cáo cho đội ngũ kỹ thuật.
- Hỗ trợ giải đáp các thắc mắc về chính sách và điều khoản sử dụng của FRESH Platform.`
        },
        ...messages
      ],
      stream: true,
    };

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000', 
        'X-Title': 'F.R.E.S.H Platform',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.text();
        console.error("Open router error", errorData);
        return NextResponse.json({ error: "OpenRouter API error" }, { status: response.status });
    }

    // Pass the stream directly to the client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error("AI Assistant Error:", error);
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 });
  }
}
