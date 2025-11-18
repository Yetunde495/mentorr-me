import { User } from "@/types/user";

export const ProfileModal: React.FC<{
  user: User | null;
  show: boolean;
  onClose: () => void;
}> = ({ user, show, onClose }) => {
  if (!user) return null;
  return (
    <div
      className={`fixed inset-0 bg-black/40 flex items-center justify-center z-50 ${
        show ? "" : "hidden"
      }`}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-xl p-6 w-[min(600px,95%)]"
      >
        <div className="flex items-center gap-4">
          <img
            src={user.avatar || "/avatar-placeholder.png"}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <div className="text-lg font-semibold">{user.name}</div>
            <div className="text-sm text-gray-500">
              {user.online ? "Online" : "Offline"}
            </div>
            <div className="mt-3 text-sm">
              Mentor bio or details go here. This is a reusable modal—fetch
              additional mentor info from /api/users/:id as needed.
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-md border">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
