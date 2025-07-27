'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BubbleChart from '@/components/BubbleChart';
import LabelList from '@/components/LabelList';
import FilterControls from '@/components/FilterControls';
import Header from '@/components/Header';
import { LabelData, LabelsData } from '@/types';

export default function Home() {
  const [labelsData, setLabelsData] = useState<LabelsData | null>(null);
  const [filteredLabels, setFilteredLabels] = useState<Record<string, LabelData>>({});
  const [minCount, setMinCount] = useState<number>(50);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('chart');
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/labels.json');
        const data = await response.json();
        setLabelsData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (labelsData) {
      const filtered = Object.entries(labelsData.labels_count)
        .filter(([name, labelData]) => {
          // Filter out labels with " - " followed by at least one digit (release numbers)
          const isReleaseNumber = / - \d/.test(name);
          if (isReleaseNumber) return false;
          
          const matchesCount = labelData.count >= minCount;
          
          // Search in both label name and mix names
          const matchesSearch = searchQuery === '' || 
            name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (labelData.mixes && labelData.mixes.some(mix => {
              const mixName = mix.split('/').pop()?.replace(/_/g, ' ') || '';
              return mixName.toLowerCase().includes(searchQuery.toLowerCase());
            }));
            
          return matchesCount && matchesSearch;
        })
        .reduce((acc, [name, data]) => {
          acc[name] = data;
          return acc;
        }, {} as Record<string, LabelData>);

      setFilteredLabels(filtered);
    }
  }, [labelsData, minCount, searchQuery]);

  const handleLabelClick = (labelName: string) => {
    setSelectedLabel(selectedLabel === labelName ? null : labelName);
  };

  const maxCount = labelsData
    ? Math.max(...Object.values(labelsData.labels_count).map(label => label.count))
    : 0;

  return (
    <main className="container mx-auto px-4 py-8">
      <Header />
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <motion.div
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      ) : (
        <>
          <FilterControls 
            minCount={minCount} 
            setMinCount={setMinCount} 
            maxCount={maxCount}
            viewMode={viewMode}
            setViewMode={setViewMode}
            totalLabels={Object.keys(filteredLabels).length}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
            {viewMode === 'chart' ? (
              <BubbleChart 
                labelsData={filteredLabels} 
                onLabelClick={handleLabelClick}
                selectedLabel={selectedLabel}
              />
            ) : (
              <LabelList 
                labelsData={filteredLabels} 
                onLabelClick={handleLabelClick}
                selectedLabel={selectedLabel}
              />
            )}
          </motion.div>
        </>
      )}
    </main>
  );
}