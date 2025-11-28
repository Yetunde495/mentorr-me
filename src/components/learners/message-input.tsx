import { useRef, useState } from "react";

interface MessageInputProps {
  onSend: (payload: {
    text?: string;
    imageFile?: File | null;
    audioFile?: Blob | null;
  }) => Promise<void>;
  sendTypingEvent: () => void; // new prop from useChat
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  sendTypingEvent,
}) => {
  const [text, setText] = useState("");
  const [isRecording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // --- Typing logic ---
  const typingTimeout = useRef<number | null>(null);

  const handleTyping = () => {
    sendTypingEvent(); // notify others
    // optional: throttle so we only send once every 700ms
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = window.setTimeout(() => {
      typingTimeout.current = null;
    }, 700);
  };

  // --- Recording ---
  const startRecording = async () => {
    if (!navigator.mediaDevices) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => audioChunks.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: "audio/webm" });
        audioChunks.current = [];
        onSend({ audioFile: blob }).catch(console.error);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch (e) {
      console.error("record error", e);
    }
  };
  const stopRecording = () => {
    try {
      mediaRecorderRef.current?.stop();
    } catch (e) {}
    setRecording(false);
  };

  // --- Image upload ---
  const pickImage = () => fileRef.current?.click();
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f) onSend({ imageFile: f }).catch(console.error);
    e.currentTarget.value = "";
  };

  // --- Submit ---
  const submit = () => {
    if (!text.trim()) return;
    onSend({ text }).catch(console.error);
    setText("");
  };

  return (
    <div className="flex mx-auto max-w-4xl items-center gap-2 p-3 border rounded-lg my-2 border-slate-200 dark:border-gray-800">
      <input
        ref={fileRef}
        onChange={onFileChange}
        type="file"
        accept="image/*"
        className="hidden"
      />
      <button
        onClick={pickImage}
        aria-label="Upload image"
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900"
      >
        {/* upload SVG */}
      </button>

      <div className="flex-1">
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message"
          className="w-full bg-transparent outline-none"
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
      </div>

      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        aria-label="Record voice"
        className={`p-2 rounded-md ${isRecording ? "bg-red-200" : ""}`}
      >
        {/* mic SVG */}
      </button>

      <button
        onClick={submit}
        className="p-2 rounded-full bg-orange-500 text-white"
      >
        {/* send SVG */}{" "}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-send"
        >
          {" "}
          <line x1="22" y1="2" x2="11" y2="13" />{" "}
          <polygon points="22 2 15 22 11 13 2 9 22 2" />{" "}
        </svg>
      </button>
    </div>
  );
};
