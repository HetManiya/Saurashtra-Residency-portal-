import React, { useState, useEffect } from 'react';
import { History, Clock, Search, Database, FileText, Settings, Key, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { AuditLogEntry } from '../types';
import { useLanguage } from '../components/LanguageContext';
import { motion } from 'motion/react';

const AuditLogs: React.FC = () => {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async (retries = 0) => {
    if (retries === 0) setLoading(true);
    try {
      const data = await api.getAuditLogs();
      setLogs(data);
      setLoading(false);
    } catch (e: any) {
      if (e.message === 'SERVER_STARTING' && retries < 5) {
        setTimeout(() => fetchLogs(retries + 1), 2000);
        return;
      }
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.details?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'ALL' || log.action?.toUpperCase() === filterAction.toUpperCase();
    return matchesSearch && matchesAction;
  });

  const getActionIcon = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'login': return <Key size={18} />;
      case 'create': return <Database size={18} />;
      case 'update': return <Settings size={18} />;
      case 'delete': return <FileText size={18} />;
      default: return <History size={18} />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'login': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'create': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'update': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
      case 'delete': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pb-6 border-b-4 border-magenta-500">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-cyan-400 mb-2 uppercase glitch-text">
            {t('saurashtra')} <span className="text-magenta-500">{t('audit')}</span>
          </h1>
          <p className="text-cyan-500/70 font-mono text-xs uppercase tracking-widest">
            {t('audit_desc')}
          </p>
        </div>
        <div className="w-full md:w-80 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500" />
          <input 
            type="text"
            placeholder={t('audit_search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black border-2 border-cyan-500 rounded-none pl-12 pr-4 py-3 text-sm font-mono text-cyan-400 focus:ring-2 focus:ring-magenta-500 outline-none shadow-[4px_4px_0px_#ff00ff] placeholder:text-cyan-900"
          />
        </div>
      </div>

      <div className="bg-black border-4 border-magenta-500 overflow-hidden shadow-[12px_12px_0px_#00ffff] crt-screen">
        <div className="p-4 border-b-2 border-magenta-500 bg-black flex flex-wrap gap-2">
          {['ALL', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'EXPORT'].map(a => (
            <button 
              key={a}
              onClick={() => setFilterAction(a)}
              className={`px-4 py-2 border-2 font-mono text-[10px] font-black uppercase tracking-widest transition-all ${
                filterAction === a 
                  ? 'bg-cyan-500 text-black border-black shadow-[2px_2px_0px_#ff00ff]' 
                  : 'text-cyan-500 border-cyan-500 hover:bg-cyan-500/10'
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <Loader2 size={40} className="animate-spin text-magenta-500 mb-4" />
            <span className="text-xs font-mono font-black text-cyan-500 uppercase tracking-widest glitch-text">
              Retrieving Cloud Logs...
            </span>
          </div>
        ) : (
          <div className="divide-y-2 divide-magenta-500/30">
            {filteredLogs.map((log) => (
              <div 
                key={log.id}
                className="p-6 hover:bg-cyan-500/5 transition-colors flex items-start gap-4"
              >
                <div className="w-12 h-12 border-2 border-cyan-500 bg-black flex items-center justify-center text-cyan-400 shrink-0 shadow-[4px_4px_0px_#ff00ff]">
                  {getActionIcon(log.action)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-sm font-black text-cyan-400 truncate uppercase font-mono">
                      {log.userName}
                    </h4>
                    <span className={`px-2 py-0.5 border font-mono text-[10px] font-black uppercase tracking-widest ${
                      log.action?.toLowerCase() === 'login' ? 'border-green-500 text-green-500' :
                      log.action?.toLowerCase() === 'create' ? 'border-blue-500 text-blue-500' :
                      log.action?.toLowerCase() === 'update' ? 'border-amber-500 text-amber-500' :
                      log.action?.toLowerCase() === 'delete' ? 'border-red-500 text-red-500' :
                      'border-cyan-500 text-cyan-500'
                    }`}>
                      {log.action}
                    </span>
                  </div>
                  <p className="text-sm font-mono text-cyan-500/70 leading-relaxed truncate">
                    {log.details}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-magenta-500 shrink-0 ml-4">
                  <Clock size={14} />
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
            {filteredLogs.length === 0 && (
              <div className="py-20 text-center">
                <span className="text-xs font-mono font-black text-cyan-900 uppercase tracking-widest">
                  No records found
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
