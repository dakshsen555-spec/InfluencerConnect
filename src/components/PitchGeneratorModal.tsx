'use client';

import React, { useState, useEffect } from 'react';
import { CreatorMatch, Campaign, Pitch } from '@/types';
import { Sparkles, X, Copy, Check, Send, ShieldCheck, RefreshCw, MessageSquare, AlertCircle } from 'lucide-react';
import { localStore } from '@/lib/supabase';

interface PitchGeneratorModalProps {
  match: CreatorMatch | null;
  campaign: Campaign;
  onClose: () => void;
  onPitchSent: (pitch: Pitch) => void;
}

export const PitchGeneratorModal: React.FC<PitchGeneratorModalProps> = ({
  match,
  campaign,
  onClose,
  onPitchSent,
}) => {
  const [tone, setTone] = useState<'friendly' | 'professional' | 'casual'>('friendly');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    if (match) {
      generatePitch(tone);
    }
  }, [match?.creator.id]);

  if (!match) return null;
  const { creator } = match;

  const handleToneChange = (newTone: 'friendly' | 'professional' | 'casual') => {
    setTone(newTone);
    generatePitch(newTone);
  };

  const generatePitch = async (selectedTone: 'friendly' | 'professional' | 'casual') => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign,
          creator,
          tone: selectedTone,
        }),
      });
      const data = await res.json();
      if (data.pitch) {
        setSubject(data.pitch.subject);
        setBody(data.pitch.body);
      }
    } catch (err) {
      console.error('Error generating pitch:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendPitch = () => {
    setIsSending(true);

    const newPitch: Pitch = {
      id: `pitch-${Date.now()}`,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      businessId: campaign.businessId,
      businessName: campaign.businessName,
      creatorId: creator.id,
      creatorName: creator.name,
      creatorEmail: creator.contactEmail,
      pitchSubject: subject,
      pitchBody: body,
      deliverables: campaign.deliverablesRequired,
      offeredAmount: campaign.budgetPerDeliverable,
      status: 'sent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStore.addPitch(newPitch);

    setTimeout(() => {
      setIsSending(false);
      setSentSuccess(true);
      onPitchSent(newPitch);
      setTimeout(() => {
        onClose();
      }, 1400);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span>Personalized Pitch to {creator.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                  Gemini AI
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Hooks creator's recent post: "{creator.recentTopPosts[0]?.title}"
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Tone Selector & Escrow Notice */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Tone:</span>
              {(['friendly', 'professional', 'casual'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  disabled={isGenerating}
                  onClick={() => handleToneChange(t)}
                  className={`text-xs px-2.5 py-1 rounded-lg capitalize font-medium transition-all ${
                    tone === t
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {isGenerating && (
                <span className="text-[11px] text-purple-400 animate-pulse font-medium hidden sm:inline">
                  Applying {tone} tone...
                </span>
              )}
              <button
                onClick={() => generatePitch(tone)}
                disabled={isGenerating}
                className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-medium self-end sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </button>
            </div>
          </div>

          {/* Subject Line */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Email / DM Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Loading pitch subject..."
            />
          </div>

          {/* Pitch Message Body */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Personalized Pitch Message
              </label>
              <span className="text-[11px] text-slate-500">{body.length} characters</span>
            </div>
            <textarea
              rows={11}
              value={body}
              onChange={e => setBody(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs sm:text-sm font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
              placeholder="Generating personalized pitch via Gemini AI..."
            />
          </div>

          {/* Escrow & Deal Terms Box */}
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-200">
                Micro-Cash Escrow Guarantee: ${campaign.budgetPerDeliverable} USD
              </p>
              <p className="text-[11px] text-emerald-400/90 mt-0.5">
                Funds are protected and only released to {creator.name} after you verify their published deliverable link.
              </p>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Message</span>
              </>
            )}
          </button>

          <button
            onClick={handleSendPitch}
            disabled={isSending || sentSuccess || !body}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
          >
            {sentSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Pitch Sent & Logged!</span>
              </>
            ) : isSending ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Locking Escrow & Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Pitch & Lock Escrow (${campaign.budgetPerDeliverable})</span>
              </>
            )}
          </button>

        </div>

      </div>
    </div>
  );
};
