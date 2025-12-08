import { useState, useEffect } from 'react';

const RealtimeClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="glass-card p-4 flex flex-col items-center justify-center">
      <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
        System Time
      </div>
      <div className="font-display text-4xl font-bold neon-text-blue tracking-wider">
        {formatTime(time)}
      </div>
      <div className="text-sm text-muted-foreground mt-1">
        {formatDate(time)}
      </div>
    </div>
  );
};

export default RealtimeClock;
