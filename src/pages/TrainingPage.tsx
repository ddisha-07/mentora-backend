import React, { useState, useEffect } from 'react';
import { Video, Calendar, PlusCircle, Search } from 'lucide-react';
import { mockService } from '../services/mockData';
import { Training } from '../types';
import { TrainingCard } from '../components/reusable';

export default function TrainingPage() {
  const [sessions, setSessions] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockService
      .fetchTraining()
      .then(data => {
        setSessions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const upcoming = sessions.filter(s => s.status === 'upcoming' || s.status === 'live');
  const completed = sessions.filter(s => s.status === 'completed');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Video className="text-primary" size={24} /> Training Calendar
          </h2>
          <p className="text-muted-foreground text-sm">Attend live virtual masterclasses, webinars, and browse previous recording archives.</p>
        </div>
        <button className="bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/95 transition-all flex items-center gap-1.5 active:scale-95 shadow-lg shadow-primary/20">
          <PlusCircle size={15} /> Schedule Session
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border border-t-primary border-r-transparent animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Upcoming & Live Section */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Live & Upcoming Sessions</h3>
            {upcoming.length === 0 ? (
              <p className="text-xs text-muted-foreground italic bg-card p-6 border border-border rounded-2xl">No upcoming live sessions scheduled. Check back later.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcoming.map(session => (
                  <TrainingCard
                    key={session.id}
                    title={session.title}
                    trainer={session.trainer}
                    description={session.description}
                    date={session.date}
                    time={session.time}
                    duration={session.duration}
                    status={session.status}
                    participants={session.participants}
                    recordingAvailable={session.recordingAvailable}
                    onJoin={() => alert(`Registered for ${session.title}!`)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Past/Completed Section */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Completed Recordings</h3>
            {completed.length === 0 ? (
              <p className="text-xs text-muted-foreground italic bg-card p-6 border border-border rounded-2xl">No recording archives available.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {completed.map(session => (
                  <TrainingCard
                    key={session.id}
                    title={session.title}
                    trainer={session.trainer}
                    description={session.description}
                    date={session.date}
                    time={session.time}
                    duration={session.duration}
                    status={session.status}
                    participants={session.participants}
                    recordingAvailable={session.recordingAvailable}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
