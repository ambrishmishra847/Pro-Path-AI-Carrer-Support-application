import React from 'react';
import { cn } from '../lib/utils';

export default function ResumePreviewSection({ section, accentColor, minimal, classic, sidebar, compact }) {
  return (
    <section>
      <h2 className={cn(
        "text-lg font-bold uppercase tracking-wider mb-4",
        minimal && "text-center text-sm border-b-0 mb-6",
        classic && "text-sm border-b mb-2",
        compact && "text-[10px] border-b mb-1 pb-0",
        !minimal && !classic && !compact && "border-b pb-1"
      )} style={{ color: classic ? '#000' : accentColor, borderColor: `${accentColor}40` }}>
        {section.title}
      </h2>
      
      {section.type === 'skills' || section.type === 'languages' ? (
        <div className={cn("flex flex-wrap gap-2", minimal && "justify-center")}>
          {section.content?.split(',').map((skill, i) => (
            <span key={i} className={cn(
              "px-3 py-1 text-sm font-medium",
              compact && "px-1 py-0 text-[9px]",
              classic ? "text-slate-800" : "bg-slate-100 text-slate-700 rounded-full"
            )}>
              {skill.trim()}
            </span>
          ))}
        </div>
      ) : (
        <div className={cn("space-y-4", compact && "space-y-1")}>
          {section.items?.map((item, i) => (
            <div key={i} className={cn(minimal && "text-center")}>
              {section.type === 'experience' && (
                <>
                  <div className={cn("flex justify-between items-start mb-1", minimal && "flex-col items-center", compact && "mb-0")}>
                    <h3 className={cn("font-bold text-slate-800", compact && "text-[10px]")}>{item.title}</h3>
                    <span className={cn("text-sm text-slate-500", compact && "text-[9px]")}>{item.period}</span>
                  </div>
                  <p className={cn("text-sm font-semibold text-slate-600 mb-2", compact && "text-[9px] mb-0")}>{item.company}</p>
                  <p className={cn("text-sm text-slate-700 whitespace-pre-wrap", compact && "text-[9px]")}>{item.description}</p>
                </>
              )}
              {section.type === 'education' && (
                <>
                  <div className={cn("flex justify-between items-start mb-1", minimal && "flex-col items-center", compact && "mb-0")}>
                    <h3 className={cn("font-bold text-slate-800", compact && "text-[10px]")}>{item.degree}</h3>
                    <span className={cn("text-sm text-slate-500", compact && "text-[9px]")}>{item.year}</span>
                  </div>
                  <p className={cn("text-sm text-slate-600", compact && "text-[9px]")}>{item.school}</p>
                </>
              )}
              {section.type === 'projects' && (
                <>
                  <div className={cn("flex justify-between items-start mb-1", compact && "mb-0")}>
                    <h3 className={cn("font-bold text-slate-800", compact && "text-[10px]")}>{item.name}</h3>
                    {item.link && <span className={cn("text-xs text-blue-600", compact && "text-[8px]")}>{item.link}</span>}
                  </div>
                  <p className={cn("text-sm text-slate-700", compact && "text-[9px]")}>{item.description}</p>
                </>
              )}
              {(section.type === 'awards' || section.type === 'certifications') && (
                <>
                  <div className={cn("flex justify-between items-start mb-1", compact && "mb-0")}>
                    <h3 className={cn("font-bold text-slate-800", compact && "text-[10px]")}>{item.title}</h3>
                    <span className={cn("text-sm text-slate-500", compact && "text-[9px]")}>{item.year}</span>
                  </div>
                  <p className={cn("text-sm text-slate-600", compact && "text-[9px]")}>{item.issuer}</p>
                </>
              )}
              {section.type === 'custom' && (
                <>
                  <h3 className={cn("font-bold text-slate-800 mb-1", compact && "text-[10px] mb-0")}>{item.title}</h3>
                  <p className={cn("text-sm text-slate-700", compact && "text-[9px]")}>{item.content}</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
