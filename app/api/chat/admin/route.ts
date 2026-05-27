import { NextResponse } from 'next/server';

// Định nghĩa kiểu dữ liệu cho tin nhắn
interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'partner' | 'admin';
  content: string;
  image?: string; // Chuỗi base64 của hình ảnh
  timestamp: number;
  read: boolean;
}

// Định nghĩa kiểu dữ liệu cho phiên chat
interface ChatSession {
  userId: string;
  userName: string;
  userRole: 'customer' | 'partner';
  messages: ChatMessage[];
  userTyping: boolean;
  adminTyping: boolean;
  lastActive: number;
  unreadCountByAdmin: number;
  unreadCountByUser: number;
}

// Khai báo biến lưu trữ in-memory toàn cục tương tự cách lưu DB client trong Next.js dev
const globalChat = global as any;
if (!globalChat.chatSessions) {
  globalChat.chatSessions = {};
}

const chatSessions: Record<string, ChatSession> = globalChat.chatSessions;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');

    // 1. Lấy danh sách toàn bộ các phiên chat (Dành cho Admin Console)
    if (action === 'get_conversations') {
      const conversations = Object.values(chatSessions).map(session => {
        const lastMsg = session.messages[session.messages.length - 1] || null;
        return {
          userId: session.userId,
          userName: session.userName,
          userRole: session.userRole,
          userTyping: session.userTyping,
          adminTyping: session.adminTyping,
          lastActive: session.lastActive,
          unreadCountByAdmin: session.unreadCountByAdmin,
          lastMessage: lastMsg ? {
            content: lastMsg.content,
            image: lastMsg.image ? true : false, // Chỉ trả về true/false để tránh truyền chuỗi base64 khổng lồ ở danh sách
            timestamp: lastMsg.timestamp,
            senderRole: lastMsg.senderRole
          } : null
        };
      }).sort((a, b) => b.lastActive - a.lastActive); // Sắp xếp cuộc trò chuyện hoạt động mới nhất lên đầu

      return NextResponse.json({ success: true, conversations });
    }

    // 2. Lấy toàn bộ tin nhắn của một cuộc hội thoại cụ thể
    if (action === 'get_messages' && userId) {
      // Nếu chưa có phiên chat cho user này, tự động tạo mới
      if (!chatSessions[userId]) {
        return NextResponse.json({ success: true, messages: [], typing: { user: false, admin: false } });
      }

      const session = chatSessions[userId];
      
      // Đánh dấu đã đọc tùy thuộc vào ai đang GET
      const viewerRole = searchParams.get('role'); // 'admin' hoặc 'user'
      if (viewerRole === 'admin') {
        session.unreadCountByAdmin = 0;
        session.messages.forEach(m => {
          if (m.senderRole !== 'admin') m.read = true;
        });
      } else {
        session.unreadCountByUser = 0;
        session.messages.forEach(m => {
          if (m.senderRole === 'admin') m.read = true;
        });
      }

      return NextResponse.json({ 
        success: true, 
        messages: session.messages,
        typing: {
          user: session.userTyping,
          admin: session.adminTyping
        }
      });
    }

    return NextResponse.json({ error: "Invalid action or parameters" }, { status: 400 });

  } catch (error) {
    console.error("Chat GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { action, userId, senderRole, senderName, content, image, isTyping, userName, userRole } = payload;

    // 1. Cập nhật trạng thái đang soạn tin (typing indicator)
    if (action === 'set_typing' && userId && senderRole) {
      if (!chatSessions[userId]) {
        // Tạo phiên chat tạm thời để ghi nhận trạng thái gõ phím
        chatSessions[userId] = {
          userId,
          userName: userName || "Người dùng",
          userRole: userRole || "customer",
          messages: [],
          userTyping: false,
          adminTyping: false,
          lastActive: Date.now(),
          unreadCountByAdmin: 0,
          unreadCountByUser: 0
        };
      }

      const session = chatSessions[userId];
      if (senderRole === 'admin') {
        session.adminTyping = !!isTyping;
      } else {
        session.userTyping = !!isTyping;
      }
      session.lastActive = Date.now();

      return NextResponse.json({ success: true });
    }

    // 2. Gửi tin nhắn mới
    if (userId && senderRole && senderName) {
      // Khởi tạo phiên chat nếu chưa tồn tại
      if (!chatSessions[userId]) {
        chatSessions[userId] = {
          userId,
          userName: senderRole !== 'admin' ? senderName : (userName || "Người dùng F.R.E.S.H"),
          userRole: senderRole !== 'admin' ? (senderRole as any) : (userRole || 'customer'),
          messages: [],
          userTyping: false,
          adminTyping: false,
          lastActive: Date.now(),
          unreadCountByAdmin: 0,
          unreadCountByUser: 0
        };
      }

      const session = chatSessions[userId];
      
      // Tạo tin nhắn mới
      const newMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 11),
        senderId: senderRole === 'admin' ? 'admin' : userId,
        senderName,
        senderRole,
        content: content || '',
        image: image || undefined, // Base64
        timestamp: Date.now(),
        read: false
      };

      session.messages.push(newMsg);
      session.lastActive = Date.now();

      // Cập nhật số tin nhắn chưa đọc
      if (senderRole === 'admin') {
        session.unreadCountByUser += 1;
        session.adminTyping = false; // Tự động tắt trạng thái gõ của admin khi tin nhắn được gửi đi
      } else {
        session.unreadCountByAdmin += 1;
        session.userTyping = false; // Tự động tắt trạng thái gõ của user khi tin nhắn được gửi đi
        // Nếu tên người dùng bị đổi hoặc cập nhật, cập nhật lại trong session
        if (senderName !== "Người dùng") {
          session.userName = senderName;
        }
      }

      return NextResponse.json({ success: true, message: newMsg });
    }

    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });

  } catch (error) {
    console.error("Chat POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
