import React, { useEffect, useState } from 'react';

interface Props {
  targetDate: string; // ISO string
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function calcTimeLeft(target: string): TimeLeft {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    expired: false,
  };
}

export default function Countdown({ targetDate }: Props) {
  const [time, setTime] = useState<TimeLeft>(() => calcTimeLeft(targetDate));

  useEffect(() => {
    if (time.expired) return;
    const id = setInterval(() => setTime(calcTimeLeft(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate, time.expired]);

  if (time.expired) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="countdown">
      {time.days > 0 && (
        <div className="countdown-unit">
          <span className="countdown-val">{time.days}</span>
          <span className="countdown-lbl">j</span>
        </div>
      )}
      <div className="countdown-unit">
        <span className="countdown-val">{pad(time.hours)}</span>
        <span className="countdown-lbl">h</span>
      </div>
      <div className="countdown-unit">
        <span className="countdown-val">{pad(time.minutes)}</span>
        <span className="countdown-lbl">m</span>
      </div>
      <div className="countdown-unit pulse">
        <span className="countdown-val">{pad(time.seconds)}</span>
        <span className="countdown-lbl">s</span>
      </div>
    </div>
  );
}
