const NotificationBanner = ({
  type,
  message,
  onClose,
}: {
  type: "success" | "error";
  message: string;
  onClose?: () => void;
}) => {
  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-md shadow-md z-50 text-white ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="mr-4">{message}</p>
        {onClose && (
          <button onClick={onClose} className="text-white font-bold">
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationBanner;
