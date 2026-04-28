import { motion } from 'framer-motion';
import { MessageCircle, Search, Send, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';

const Messaging = () => {
  return (
    <div className="h-[calc(100vh-160px)] flex gap-8">
      {/* Sidebar de messagerie */}
      <div className="w-96 flex flex-col gap-6">
        <div className="glass-card p-6 rounded-[2rem] border border-white/5 flex flex-col h-full">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Rechercher une discussion..."
              className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-brand-primary placeholder:text-gray-600"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
            {[
              { name: 'Support Bamousso', lastMsg: 'Comment pouvons-nous vous aider ?', time: '10:30', active: true, unread: 1 },
              { name: 'RH Manager', lastMsg: 'Le rapport est prêt.', time: 'Hier', active: false },
              { name: 'Équipe Marketing', lastMsg: 'Réunion à 14h.', time: 'Lundi', active: false },
            ].map((chat, i) => (
              <button 
                key={i}
                className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all ${chat.active ? 'bg-brand-primary/20 border border-brand-primary/30' : 'hover:bg-white/5 border border-transparent'}`}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-white font-black shrink-0">
                  {chat.name[0]}
                </div>
                <div className="min-w-0 text-left">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-black text-white truncate">{chat.name}</p>
                    <p className="text-[10px] text-gray-500 font-bold">{chat.time}</p>
                  </div>
                  <p className="text-xs text-gray-400 truncate font-medium">{chat.lastMsg}</p>
                </div>
                {chat.unread && (
                  <div className="w-5 h-5 bg-brand-primary rounded-full flex items-center justify-center text-[10px] font-black text-white">
                    {chat.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Zone de chat principale */}
      <div className="flex-1 glass-card rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col relative">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-white font-black shadow-lg">
              S
            </div>
            <div>
              <p className="text-lg font-black text-white">Support Bamousso</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">En ligne</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-3 hover:bg-white/10 rounded-xl text-gray-400 transition-colors"><Phone className="w-5 h-5" /></button>
            <button className="p-3 hover:bg-white/10 rounded-xl text-gray-400 transition-colors"><Video className="w-5 h-5" /></button>
            <button className="p-3 hover:bg-white/10 rounded-xl text-gray-400 transition-colors"><MoreVertical className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto space-y-6 custom-scrollbar bg-senufo opacity-20" />
        
        <div className="absolute inset-0 p-8 flex flex-col justify-end pointer-events-none">
          <div className="space-y-6 pointer-events-auto">
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-bl-none max-w-md">
                <p className="text-sm text-white font-medium">Bonjour ! Comment puis-je aider l'équipe Bamousso aujourd'hui ?</p>
                <p className="text-[10px] text-gray-500 font-bold mt-2">10:30</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/5 border-t border-white/5">
          <div className="flex items-center gap-4">
            <button className="p-4 hover:bg-white/10 rounded-2xl text-gray-500 transition-colors">
              <Paperclip className="w-6 h-6" />
            </button>
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Votre message..."
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white font-medium outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            <button className="bg-brand-primary text-white p-4 rounded-2xl shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all">
              <Send className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messaging;
