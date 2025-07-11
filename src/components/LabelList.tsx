'use client';

import { useState, useRef } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { motion, AnimatePresence } from 'framer-motion';
import { LabelData } from '@/types';

interface LabelListProps {
  labelsData: Record<string, LabelData>;
  onLabelClick: (labelName: string) => void;
  selectedLabel: string | null;
}

const LabelList = ({ labelsData, onLabelClick, selectedLabel }: LabelListProps) => {
  // Track expanded labels to show mixes
  const [expandedLabels, setExpandedLabels] = useState<Record<string, boolean>>({});
  const virtuosoRef = useRef(null);
  
  // Convert to array and sort by count (descending)
  const sortedLabels = Object.entries(labelsData)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count);
    
  // Toggle expanded state for a label
  const toggleExpanded = (labelName: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedLabels(prev => ({
      ...prev,
      [labelName]: !prev[labelName]
    }));
  };
  
  // Handle row click - selects label and toggles expanded state
  const handleRowClick = (labelName: string) => {
    onLabelClick(labelName);
    setExpandedLabels(prev => ({
      ...prev,
      [labelName]: !prev[labelName]
    }));
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-lg overflow-hidden shadow-lg">
        <Virtuoso
          style={{ height: '500px' }}
          totalCount={sortedLabels.length}
          itemContent={(index) => {
            const label = sortedLabels[index];
            const isSelected = label.name === selectedLabel;
            
            return (
              <div>
                <motion.div
                  className={`p-4 border-b border-gray-700 cursor-pointer transition-colors ${isSelected ? 'bg-card/80' : 'hover:bg-card/50'}`}
                  onClick={() => handleRowClick(label.name)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03, duration: 0.3 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ 
                          backgroundColor: `hsl(${(label.count * 1.2) % 360}, 70%, 60%)`,
                          boxShadow: `0 0 8px hsl(${(label.count * 1.2) % 360}, 70%, 60%)`
                        }}
                      />
                      <h3 className="font-medium">{label.name}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">
                        {label.count} {label.count === 1 ? 'appearance' : 'appearances'}
                      </div>
                      <button 
                        onClick={(e) => toggleExpanded(label.name, e)}
                        className="text-xs bg-gray-700 hover:bg-gray-600 p-1 rounded-full transition-colors"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`h-4 w-4 transition-transform ${expandedLabels[label.name] ? 'rotate-180' : ''}`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
                
                <AnimatePresence>
                  {expandedLabels[label.name] && label.mixes && label.mixes.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="bg-gray-800 pl-10 pr-4 py-2 border-b border-gray-700"
                    >
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {label.mixes.map((mix, mixIndex) => {
                          // Extract mix name from URL
                          const mixName = mix.split('/').pop()?.replace(/_/g, ' ') || mix;
                          
                          return (
                            <motion.a
                              key={mixIndex}
                              href={mix}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sm text-blue-400 hover:text-blue-300 truncate"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: mixIndex * 0.02 }}
                            >
                              {mixName}
                            </motion.a>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }}
        />
      </div>

    </div>
  );
};

export default LabelList;