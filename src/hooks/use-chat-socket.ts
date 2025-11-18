import { mockMentor, mockMessages } from "@/lib/mockdata";
import { ChatMessage, Message } from "@/types/message";
import { User } from "@/types/user";
import { useEffect, useRef, useState } from "react";

export function useChatSocket({ userId, mentorId, wsUrl }: { userId: string; mentorId: string; wsUrl: string }) {
  const wsRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [mentor, setMentor] = useState<User | null>(mockMentor);

  useEffect(() => {
    let mounted = true;

    // Use fetch instead of axios to avoid bundling node-specific code
    (async () => {
      try {
        const res = await fetch(`/api/chat/${mentorId}/history`);
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          setMessages(data || []);
        }
      } catch (e) {
        console.error('history fetch error', e);
      }
    })();

    (async () => {
      try {
        const res = await fetch(`/api/users/${mentorId}`);
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          setMentor(data);
        }
      } catch (e) {
        console.error('mentor fetch error', e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [mentorId]);

  useEffect(() => {
    if (!wsUrl) return;
    try {
      wsRef.current = new WebSocket(wsUrl);
    } catch (e) {
      console.error('WebSocket init error', e);
      return;
    }

    const ws = wsRef.current;
    ws.onopen = () => console.log('ws open');
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.type === 'message') setMessages((s) => [...s, data.payload]);
        if (data.type === 'presence') setMentor((m) => (m && m.id === data.payload.id ? { ...m, online: data.payload.online } : m));
        if (data.type === 'read') setMessages((s) => s.map((m) => (m.id === data.payload.messageId ? { ...m, read: true } : m)));
      } catch (e) {
        console.error('ws parse err', e);
      }
    };
    ws.onclose = () => console.log('ws closed');
    ws.onerror = (ev) => console.error('ws error', ev);

    return () => {
      try {
        ws.close();
      } catch (e) {
        // noop
      }
    };
  }, [wsUrl]);

  const sendMessage = async (payload: Partial<ChatMessage>) => {
    const temp: ChatMessage = {
      id: `tmp-${Date.now()}`,
      fromId: userId,
      toId: mentorId,
      type: 'text',
      timestamp: new Date().toISOString(),
      sender: "learner",
      ...payload,
    } as ChatMessage;
    setMessages((s) => [...s, temp]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'message', payload: temp }));
      return;
    }

    // fallback to fetch POST
    try {
      await fetch(`/api/chat/${mentorId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.error('send fallback error', e);
    }
  };

  const markAsRead = (messageId: string) => {
    setMessages((s) => s.map((m) => (m.id === messageId ? { ...m, read: true } : m)));
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'read', payload: { messageId, userId } }));
    }
  };

  return { messages, mentor, sendMessage, markAsRead, setMessages };
}
