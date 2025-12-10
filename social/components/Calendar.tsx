import React, { useState, useEffect } from 'react';
import { useTranslations } from '../context/LanguageContext';
import { DateRange } from '../types';

interface CalendarProps {
  onRangeSelect: (range: DateRange | null) => void;
}

const Calendar: React.FC<CalendarProps> = ({ onRangeSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const { lang } = useTranslations();

  useEffect(() => {
    if (startDate && endDate) {
      onRangeSelect({ start: startDate, end: endDate });
    } else {
      onRangeSelect(null);
    }
  }, [startDate, endDate, onRangeSelect]);

  const handleDateClick = (day: Date) => {
    if (!startDate || (startDate && endDate)) {
      // Start new selection
      setStartDate(day);
      setEndDate(null);
    } else if (startDate && !endDate) {
      // Finish selection
      if (day < startDate) {
        setEndDate(startDate);
        setStartDate(day);
      } else {
        setEndDate(day);
      }
    }
  };

  const getCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const days = [];

    const startDay = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;

    for (let i = startDay; i > 0; i--) {
        days.push({ day: new Date(year, month, 1 - i), isCurrentMonth: false });
    }

    for (let i = 1; i <= new Date(year, month + 1, 0).getDate(); i++) {
        days.push({ day: new Date(year, month, i), isCurrentMonth: true });
    }
    
    while(days.length < 42) {
        const lastDay = days[days.length-1].day;
        days.push({ day: new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate() + 1), isCurrentMonth: false });
    }
    return days;
  };
  
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const days = getCalendarDays(currentDate);
  const weekdays = lang === 'es' || lang === 'va'
    ? ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']
    : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  return (
    <div className="bg-white/60 p-4 rounded-lg shadow-inner">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-200 transition-colors">&lt;</button>
        <div className="font-bold text-lg capitalize">
          {currentDate.toLocaleDateString(lang, { month: 'long', year: 'numeric' })}
        </div>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-200 transition-colors">&gt;</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 mb-2">
        {weekdays.map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map(({ day, isCurrentMonth }, index) => {
          const isStartDate = startDate && day.getTime() === startDate.getTime();
          const isEndDate = endDate && day.getTime() === endDate.getTime();
          const isInRange = startDate && endDate && day > startDate && day < endDate;
          const isHovering = startDate && !endDate && hoverDate && (
            (day > startDate && day < hoverDate) || (day < startDate && day > hoverDate)
          );
          const isHoveringEnd = startDate && !endDate && hoverDate && day.getTime() === hoverDate.getTime();
          
          let buttonClasses = 'w-9 h-9 flex items-center justify-center transition-colors duration-150 text-sm';

          if (!isCurrentMonth) {
            buttonClasses += ' text-slate-400 cursor-not-allowed rounded-full';
          } else {
            buttonClasses += ' text-slate-700 hover:bg-teal-100 rounded-full';
          }

          if (isStartDate || isEndDate || isHoveringEnd) {
            buttonClasses += ' bg-[#8EB8BA] text-white font-bold';
          } else if (isInRange || isHovering) {
            buttonClasses = buttonClasses.replace('rounded-full', 'rounded-none');
            buttonClasses += ' bg-teal-200';
          }
          
          return (
            <button
              key={index}
              onClick={() => isCurrentMonth && handleDateClick(day)}
              onMouseEnter={() => isCurrentMonth && setHoverDate(day)}
              onMouseLeave={() => setHoverDate(null)}
              className={buttonClasses}
              disabled={!isCurrentMonth}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
