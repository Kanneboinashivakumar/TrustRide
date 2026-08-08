import React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { AuditBlock } from '@/types/audit';

export interface HashChainProps {
  blocks: AuditBlock[];
  className?: string;
}

const truncateHash = (hash: string) => {
  if (!hash || hash.length < 12) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
};

export const HashChain: React.FC<HashChainProps> = ({ blocks, className }) => {
  return (
    <div className={cn("w-full overflow-x-auto pb-4", className)}>
      <div className="flex items-center min-w-max p-1">
        {blocks.map((block, index) => {
          const isLast = index === blocks.length - 1;
          
          return (
            <React.Fragment key={block.hash || index}>
              <div className="group relative flex flex-col p-3 rounded-lg border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all hover:border-blue-200 w-48">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Block #{block.index ?? index}
                  </span>
                  <span className="text-xs text-slate-400">
                    {block.entryCount ?? block.entries?.length ?? 0} entries
                  </span>
                </div>
                
                <div className="font-mono text-sm font-medium text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-100 truncate cursor-default">
                  {truncateHash(block.hash)}
                  
                  {/* Tooltip for full hash */}
                  <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity top-full left-0 mt-2 p-2 bg-slate-900 text-white text-xs rounded shadow-lg z-10 w-max max-w-xs break-all pointer-events-none">
                    {block.hash}
                  </div>
                </div>
                
                <div className="text-[10px] text-slate-400 mt-2 text-right">
                  {new Date(block.timestamp).toLocaleString()}
                </div>
              </div>
              
              {!isLast && (
                <div className="flex items-center justify-center w-8 text-slate-300">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
