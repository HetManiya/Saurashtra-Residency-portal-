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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white mb-2">
            {t('saurashtra')} <span className="text-brand-600">{t('audit')}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {t('audit_desc')}
          </p>
        </div>
        <div className="w-full md:w-80 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder={t('audit_search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-wrap gap-2">
          {['ALL', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'EXPORT'].map(a => (
            <button 
              key={a}
              onClick={() => setFilterAction(a)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filterAction === a 
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <Loader2 size={40} className="animate-spin text-brand-600 mb-4" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Retrieving Cloud Logs...
            </span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLogs.map((log) => (
              <div 
                key={log.id}
                className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
                  {getActionIcon(log.action)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                      {log.userName}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed truncate">
                    {log.details}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 shrink-0 ml-4">
                  <Clock size={14} />
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
            {filteredLogs.length === 0 && (
              <div className="py-20 text-center">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
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
