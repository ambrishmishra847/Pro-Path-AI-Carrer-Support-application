import React, { useEffect } from 'react';
import { Globe } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdSense({ className, variant = 'horizontal', slot }) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className={cn(
      "bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden relative flex items-center justify-center bg-slate-50/50",
      variant === 'horizontal' && "w-full h-24 md:h-32",
      variant === 'vertical' && "w-full md:w-64 h-64 md:h-full min-h-[300px]",
      variant === 'square' && "w-full aspect-square max-w-[300px]",
      className
    )}>
      <div className="absolute top-0 right-0 p-2 z-10">
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Advertisement</span>
      </div>
      
      {/* Real AdSense Unit */}
      <ins className="adsbygoogle"
           style={{ display: 'block', width: '100%', height: '100%' }}
           data-ad-client="ca-pub-1477502697359551"
           data-ad-slot={slot || "default-slot"}
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>

      {/* Fallback placeholder (visible if ad fails to load or in dev) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center -z-10 pointer-events-none">
        <Globe className="text-slate-200 mb-2" size={variant === 'horizontal' ? 24 : 32} />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Google AdSense</p>
      </div>
    </div>
  );
}
