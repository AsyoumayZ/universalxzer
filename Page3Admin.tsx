import React, { useEffect, useState } from 'react';
import { Save, Plus, Trash2, Sliders, Palette, Smartphone, Eye } from 'lucide-react';
import { supabase, triggerHaptic } from '../lib/supabase';
import { Page1Config, Page2Config, DisplayZone } from '../types/pageConfig';

export const Page3Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'page1' | 'page2'>('page1');
  const [page1, setPage1] = useState<Page1Config | null>(null);
  const [page2, setPage2] = useState<Page2Config | null>(null);
  const [status, setStatus] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: p1 } = await supabase.from('page_configurations').select('config').eq('id', 'page1').single();
    if (p1?.config) setPage1(p1.config as Page1Config);

    const { data: p2 } = await supabase.from('page_configurations').select('config').eq('id', 'page2').single();
    if (p2?.config) setPage2(p2.config as Page2Config);
  };

  const saveConfiguration = async () => {
    setSaving(true);
    triggerHaptic([50, 100, 50]);
    setStatus('Saving changes to Supabase...');

    const targetConfig = activeTab === 'page1' ? page1 : page2;
    const { error } = await supabase
      .from('page_configurations')
      .upsert({ id: activeTab, config: targetConfig, updated_at: new Date().toISOString() });

    if (error) {
      setStatus(`Error: ${error.message}`);
    } else {
      setStatus('Successfully published! Live visitors have received the update.');
      setTimeout(() => setStatus(''), 4000);
    }
    setSaving(false);
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'bgMediaUrl' | 'audioUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus('Uploading media to Supabase Storage...');
    const filename = `media_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;
    const { error } = await supabase.storage.from('app-assets').upload(filename, file);
    if (!error) {
      const { data } = supabase.storage.from('app-assets').getPublicUrl(filename);
      if (activeTab === 'page1' && page1) {
        setPage1({ ...page1, [field]: data.publicUrl });
      } else if (activeTab === 'page2' && page2) {
        setPage2({ ...page2, [field]: data.publicUrl });
      }
      setStatus('Upload complete!');
    } else {
      setStatus(`Upload failed: ${error.message}`);
    }
  };

  const addDisplayZone = () => {
    if (!page2) return;
    const newZone: DisplayZone = {
      id: Date.now().toString(),
      title: 'New Display Area',
      content: 'Edit this text from the control panel.',
      style: 'card-glass',
    };
    setPage2({ ...page2, displayZones: [...page2.displayZones, newZone] });
  };

  const removeDisplayZone = (id: string) => {
    if (!page2) return;
    setPage2({ ...page2, displayZones: page2.displayZones.filter((z) => z.id !== id) });
  };

  if (!page1 || !page2) {
    return <div className="p-8 text-center text-slate-400">Loading configurations...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-sky-400 flex items-center gap-2">
            <Sliders className="w-7 h-7" /> Universal CMS Admin
          </h1>
          <p className="text-xs md:text-sm text-slate-400">Live iPad-friendly web manager</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={activeTab === 'page1' ? '/' : '/page2'}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 text-slate-300"
          >
            <Eye className="w-4 h-4" /> Preview Live
          </a>
          <button
            onClick={saveConfiguration}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow-lg active:scale-95 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Publish Live'}
          </button>
        </div>
      </div>

      {status && (
        <div className="mt-4 p-3 bg-sky-950 border border-sky-800 text-sky-200 text-sm rounded-xl text-center">
          {status}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 my-6">
        <button
          onClick={() => setActiveTab('page1')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition ${
            activeTab === 'page1' ? 'bg-sky-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          Page 1 (Hero & QR Gateway)
        </button>
        <button
          onClick={() => setActiveTab('page2')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition ${
            activeTab === 'page2' ? 'bg-sky-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          Page 2 (Showcase, Files & Chat)
        </button>
      </div>

      {/* Page 1 Configuration Panel */}
      {activeTab === 'page1' && (
        <div className="space-y-6">
          {/* Background Settings */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-sky-300 flex items-center gap-2">
              <Palette className="w-5 h-5" /> Background, Video & Audio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-medium">Background Type</label>
                <select
                  value={page1.bgType}
                  onChange={(e) => setPage1({ ...page1, bgType: e.target.value as any })}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm"
                >
                  <option value="color">Solid Color</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Background Color</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    value={page1.bgColor}
                    onChange={(e) => setPage1({ ...page1, bgColor: e.target.value })}
                    className="w-12 h-10 bg-slate-800 border border-slate-700 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={page1.bgColor}
                    onChange={(e) => setPage1({ ...page1, bgColor: e.target.value })}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Upload Media (Image / Video)</label>
                <input
                  type="file"
                  onChange={(e) => handleMediaUpload(e, 'bgMediaUrl')}
                  className="w-full mt-1 text-xs text-slate-400 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-slate-800 file:text-sky-400 hover:file:bg-slate-700"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium">Audio URL (Plays on Page 1)</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={page1.audioUrl}
                  onChange={(e) => setPage1({ ...page1, audioUrl: e.target.value })}
                  placeholder="https://..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm"
                />
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleMediaUpload(e, 'audioUrl')}
                  className="text-xs text-slate-400 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-slate-800 file:text-sky-400"
                />
              </div>
            </div>
          </div>

          {/* Typography & Animations */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-sky-300">Typography, Color Effects & Vibrations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400">Title Text</label>
                <input
                  type="text"
                  value={page1.title}
                  onChange={(e) => setPage1({ ...page1, title: e.target.value })}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Subtitle Text</label>
                <input
                  type="text"
                  value={page1.subtitle}
                  onChange={(e) => setPage1({ ...page1, subtitle: e.target.value })}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Title Color</label>
                <input
                  type="color"
                  value={page1.titleColor}
                  onChange={(e) => setPage1({ ...page1, titleColor: e.target.value })}
                  className="w-full h-10 mt-1 bg-slate-800 border border-slate-700 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Visual Effect</label>
                <select
                  value={page1.titleEffect}
                  onChange={(e) => setPage1({ ...page1, titleEffect: e.target.value as any })}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm"
                >
                  <option value="none">None</option>
                  <option value="glow">Glow Drop</option>
                  <option value="neon">Neon Tube</option>
                  <option value="3d">3D Emboss</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400">Vibration / Motion Animation</label>
                <select
                  value={page1.titleVibe}
                  onChange={(e) => setPage1({ ...page1, titleVibe: e.target.value as any })}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm"
                >
                  <option value="none">None</option>
                  <option value="vibe-subtle">Subtle Shiver</option>
                  <option value="vibe-intense">Intense Vibrate</option>
                  <option value="vibe-pulse">Pulsing</option>
                  <option value="vibe-bounce">Bouncing</option>
                </select>
              </div>
            </div>
          </div>

          {/* QR Code & Button Settings */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-sky-300 flex items-center gap-2">
              <Smartphone className="w-5 h-5" /> QR Code & Enter Button Customizer
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-400">QR Target URL</label>
                <input
                  type="text"
                  value={page1.qrTargetUrl}
                  onChange={(e) => setPage1({ ...page1, qrTargetUrl: e.target.value })}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">QR Color</label>
                <input
                  type="color"
                  value={page1.qrColor}
                  onChange={(e) => setPage1({ ...page1, qrColor: e.target.value })}
                  className="w-full h-9 mt-1 bg-slate-800 border border-slate-700 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">QR Vibration</label>
                <select
                  value={page1.qrVibe}
                  onChange={(e) => setPage1({ ...page1, qrVibe: e.target.value as any })}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
                >
                  <option value="none">None</option>
                  <option value="vibe-subtle">Subtle Shiver</option>
                  <option value="vibe-intense">Intense Shake</option>
                  <option value="vibe-pulse">Pulse</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400">Button Text</label>
                <input
                  type="text"
                  value={page1.buttonText}
                  onChange={(e) => setPage1({ ...page1, buttonText: e.target.value })}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Button Link</label>
                <input
                  type="text"
                  value={page1.buttonLink}
                  onChange={(e) => setPage1({ ...page1, buttonLink: e.target.value })}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Button Animation</label>
                <select
                  value={page1.buttonVibe}
                  onChange={(e) => setPage1({ ...page1, buttonVibe: e.target.value as any })}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
                >
                  <option value="none">None</option>
                  <option value="vibe-bounce">Bounce</option>
                  <option value="vibe-pulse">Pulse</option>
                  <option value="vibe-intense">Intense Vibrate</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page 2 Configuration Panel */}
      {activeTab === 'page2' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-sky-300">Page 2 Header & Layout</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400">Page 2 Title</label>
                <input
                  type="text"
                  value={page2.title}
                  onChange={(e) => setPage2({ ...page2, title: e.target.value })}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Title Color</label>
                <input
                  type="color"
                  value={page2.titleColor}
                  onChange={(e) => setPage2({ ...page2, titleColor: e.target.value })}
                  className="w-full h-10 mt-1 bg-slate-800 border border-slate-700 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Multi Display Areas Manager */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sky-300">Multi Display Zones</h3>
              <button
                onClick={addDisplayZone}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Zone
              </button>
            </div>

            <div className="space-y-4">
              {page2.displayZones.map((zone, idx) => (
                <div key={zone.id} className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400">Zone #{idx + 1}</span>
                    <button onClick={() => removeDisplayZone(zone.id)} className="text-rose-400 hover:text-rose-300 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={zone.title}
                      onChange={(e) => {
                        const updated = [...page2.displayZones];
                        updated[idx].title = e.target.value;
                        setPage2({ ...page2, displayZones: updated });
                      }}
                      placeholder="Zone Title"
                      className="bg-slate-900 border border-slate-700 rounded p-2 text-sm"
                    />
                    <select
                      value={zone.style}
                      onChange={(e) => {
                        const updated = [...page2.displayZones];
                        updated[idx].style = e.target.value as any;
                        setPage2({ ...page2, displayZones: updated });
                      }}
                      className="bg-slate-900 border border-slate-700 rounded p-2 text-sm"
                    >
                      <option value="card-glass">Glassmorphism Card</option>
                      <option value="card-bordered">Border Glow Card</option>
                      <option value="card-solid">Solid Dark Card</option>
                    </select>
                  </div>
                  <textarea
                    value={zone.content}
                    onChange={(e) => {
                      const updated = [...page2.displayZones];
                      updated[idx].content = e.target.value;
                      setPage2({ ...page2, displayZones: updated });
                    }}
                    rows={3}
                    placeholder="Content or description..."
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};