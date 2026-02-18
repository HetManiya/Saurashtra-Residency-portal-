
import React, { useState, useEffect } from 'react';
import { History, Clock, Search, Database, FileText, Settings, Key, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { AuditLogEntry } from '../types';
import { useLanguage } from '../components/LanguageContext';

const AuditLogs: React.FC = () => {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const data = await api.getAuditLogs();
    setLogs(data);
    setLoading(false);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.details?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'ALL' || log.action?.toUpperCase() === filterAction.toUpperCase();
    return matchesSearch && matchesAction;
  });

  const getActionIcon = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'login': return <Key className="text-emerald-500" size={16} />;
      case 'create': return <Database className="text-blue-500" size={16} />;
      case 'update': return <Settings className="text-amber-500" size={16} />;
      case 'delete': return <FileText className="text-rose-500" size={16} />;
      default: return <History className="text-slate-400" size={16} />;
    }
  };

  return (
    <div className="space-y-10 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tighter">{t('saurashtra')} <span className="text-brand-600">{t('audit')}</span></h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">{t('audit_desc')}</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" placeholder={t('audit_search')}
              className="pl-12 pr-6 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 premium-shadow overflow-hidden">
          <div className="p-8 border-b border-slate-50 dark:border-slate-800/50 flex flex-wrap gap-3">
            {['ALL', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'EXPORT'].map(a => (
              <button 
                key={a}
                onClick={() => setFilterAction(a)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterAction === a ? 'bg-brand-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600'}`}
              >
                {a}
              </button>
            ))}
          </div>
          
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-brand-600 mb-4" size={32} />
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Retrieving Cloud Logs...</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-8 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all flex items-start gap-6 group">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-all">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-slate-900 dark:text-white text-base tracking-tight">{log.userName}</span>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-500">{log.action}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                        <Clock size={14} />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium text-sm leading-relaxed">
                      {log.details}
                    </p>
                  </div>
                </div>
              ))}
              {filteredLogs.length === 0 && (
                <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No records found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
