export function Avatar({ className = "" }: { className?: string }) {
    return (
      <div className={`rounded-full bg-blue-400 text-white flex items-center justify-center ${className}`}>
        👤
      </div>
    );
  }
  
