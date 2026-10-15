import React, { useEffect, useState, useRef } from 'react';
import { Send, Upload, Download, Lock, Globe, MessageSquare } from 'lucide-react';
import { supabase, triggerHaptic } from '../lib/supabase';
import { Page2Config, ChatMessage, DisplayZone } from '../types/pageConfig';

const defaultConfig: Page2Config = {
  bgType: 'color',
  bgColor: '#090d16',
  bgMediaUrl: '',
  audioUrl: '',
  title: 'Interactive Showcase & Community',
  titleColor: '#38bdf8',
  titleSize: 'text-4xl',
  titleEffect: 'glow',
  titleVibe: 'none',
  displayZones: [
    { id: '1', title: 'Main Display', content: 'Universal zone ready for rich custom media and text.', style: 'card-glass' },
    { id: '2', title: 'Secondary Board', content: 'Configured instantly from the iPad Admin panel.', style: 'card-bordered' }
  ],
};

export const Page2: React.FC = () => {
  const [config, setConfig] = useState<Page2Config>(defaultConfig);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [senderName, setSenderName] = useState(localStorage.getItem('chat_name') || 'Visitor_' + Math.floor(Math.random() * 1000));
  const [recipient, setRecipient] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // 1. Fetch Page 2 Configuration
    supabase.from('page_configurations').select('config').eq('id', 'page2').single().then(({ data }) => {
      if (data?.config) setConfig(data.config as Page2Config);
    });

    // 2. Fetch Chat Messages
    supabase.from('chat_messages').select('*').order('created_at', { ascending: true }).limit(50).then(({ data }) => {
      if (data) setMessages(data as ChatMessage[]);
    });

    // 3. Subscribe to Realtime Messages
    const chatChannel = supabase
      .channel('chat_room')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        setMessages((prev) => [...prev, payload.new as ChatMessage]);
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      })
      .subscribe();

    // 4. Fetch list of uploaded assets
    fetchFiles();

    return () => {
      supabase.removeChannel(chatChannel);
    };
  }, []);

  const fetchFiles = async () => {
    const { data } = await supabase.storage.from('app-assets').list('', { limit: 20 });
    if (data) {
      const filesWithUrls = data.map((item) => {
        const { data: urlData } = supabase.storage.from('app-assets').getPublicUrl(item.name);
        return { name: item.name, url: urlData.publicUrl };
      });
      setUploadedFiles(filesWithUrls);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    triggerHaptic(50);

    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;
    const { error } = await supabase.storage.from('app-assets').upload(fileName, file);
    if (!error) {
      await fetchFiles();
      triggerHaptic([40, 60, 40]);
    }
    setUploading(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    triggerHaptic(40);
    localStorage.setItem('chat_name', senderName);

    await supabase.from('chat_messages').insert({
      sender_name: senderName,
      message: newMessage,
      is_private: isPrivate,
      recipient_name: isPrivate ? recipient : null,
      room_id: 'general',
    });

    setNewMessage('');
  };

  const visibleMessages = messages.filter((msg) => {
    if (!msg.is_private) return true;
    return msg.sender_name === senderName || msg.recipient_name === senderName;
  });

  return (
    <div
      className="min-h-screen w-full p-4 md:p-8 flex flex-col items-center"
      style={{
        backgroundColor: config.bgType === 'color' ? config.bgColor : undefined,
        backgroundImage: config.bgType === 'image' && config.bgMediaUrl ? `url(${config.bgMediaUrl})` : undefined,
        backgroundSize: 'cover',
      }}
    >
      {/* Title */}
      <h1 className={`font-black text-center mb-8 ${config.titleSize}`} style={{ color: config.titleColor }}>
        {config.title}
      </h1>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Dynamic Multi Display Areas & Files */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-200 border-b border-slate-700 pb-2">Display Zones</h2>
          <div className="grid gap-4">
            {config.displayZones?.map((zone) => (
              <div
                key={zone.id}
                className={`p-6 rounded-2xl backdrop-blur-md transition ${
                  zone.style === 'card-glass'
                    ? 'bg-white/10 border border-white/20 shadow-xl'
                    : zone.style === 'card-bordered'
                    ? 'bg-slate-900 border-2 border-sky-500/40 shadow-lg'
                    : 'bg-slate-800 shadow-md'
                }`}
              >
                <h3 className="text-xl font-bold text-sky-300 mb-2">{zone.title}</h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{zone.content}</p>
              </div>
            ))}
          </div>

          {/* File Storage & Downloads */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl backdrop-blur-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Download className="w-5 h-5 text-sky-400" /> Public Downloads & Uploads
              </h3>
              <label className="cursor-pointer bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 active:scale-95 transition">
                <Upload className="w-4 h-4" />
                <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                <input type="file" onChange={handleFileUpload} disabled={uploading} className="hidden" />
              </label>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {uploadedFiles.length === 0 ? (
                <p className="text-slate-500 text-sm">No files uploaded yet.</p>
              ) : (
                uploadedFiles.map((f, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                    <span className="text-sm truncate max-w-xs text-slate-300">{f.name}</span>
                    <a
                      href={f.url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-sky-300 font-semibold"
                    >
                      Download
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Public & Private Realtime Chat */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col h-[650px] shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" /> Realtime Chat
            </h2>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Your Name"
                className="bg-slate-800 text-xs px-2.5 py-1.5 rounded border border-slate-700 text-white w-28"
              />
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {visibleMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-xl max-w-[85%] ${
                  msg.sender_name === senderName
                    ? 'ml-auto bg-sky-600 text-white'
                    : msg.is_private
                    ? 'bg-amber-950/80 border border-amber-600/40 text-amber-200'
                    : 'bg-slate-800 text-slate-200 border border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1 opacity-75">
                  <span className="font-bold">{msg.sender_name}</span>
                  {msg.is_private && (
                    <span className="flex items-center gap-1 text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-amber-300">
                      <Lock className="w-3 h-3" /> To: {msg.recipient_name}
                    </span>
                  )}
                </div>
                <p className="text-sm break-words">{msg.message}</p>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Controls & Input Form */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPrivate(!isPrivate)}
                className={`text-xs px-2.5 py-1 rounded flex items-center gap-1 font-semibold transition ${
                  isPrivate ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isPrivate ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                {isPrivate ? 'Private' : 'Public'}
              </button>
              {isPrivate && (
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Recipient Name"
                  required
                  className="bg-slate-800 border border-slate-700 text-xs px-2.5 py-1 rounded text-white flex-1"
                />
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={isPrivate ? `Message ${recipient || 'user'} privately...` : 'Send a message...'}
                className="flex-1 bg-slate-800 border border-slate-700 text-sm px-3 py-2 rounded-xl text-white focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-xl flex items-center justify-center active:scale-95 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};