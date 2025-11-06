export function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-linear-to-br from-white to-gray-100 z-9999">
      <div className="relative">
        <div className="w-28 h-28 rounded-full border-2 border-transparent border-t-[#0a66c2] animate-[spin_2.8s_linear_infinite,pulse_2.4s_ease-in-out_infinite] shadow-[0_0_16px_rgba(10,102,194,0.25)]" />
        <div className="absolute top-1/2 left-1/2 w-20 h-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-transparent border-t-sky-400 opacity-60 animate-[spin_2.8s_linear_infinite,pulse_2.4s_ease-in-out_infinite] [animation-delay:0.5s]" />
      </div>
    </div>
  );
}
