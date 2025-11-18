import { useRef, useState } from "react";

export const MessageInput: React.FC<{
  onSend: (payload: {
    text?: string;
    imageFile?: File | null;
    audioFile?: Blob | null;
  }) => Promise<void>;
}> = ({ onSend }) => {
  const [text, setText] = useState("");
  const [isRecording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);

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
    } catch (e) {
      // noop
    }
    setRecording(false);
  };

  const pickImage = () => fileRef.current?.click();
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f) onSend({ imageFile: f }).catch(console.error);
    e.currentTarget.value = "";
  };

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
        {/* simple upload SVG */}
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
          className="feather feather-upload"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </button>

      <div className="flex-1">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
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
          className="feather feather-mic"
        >
          <path d="M12 1v11" />
          <path d="M19 11a7 7 0 0 1-14 0" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </button>

      <button
        onClick={submit}
        className="p-2 rounded-full bg-orange-500 text-white"
      >
        {/* send SVG */}
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
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
};
