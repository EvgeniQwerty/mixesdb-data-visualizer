import { motion } from 'framer-motion';

interface FilterControlsProps {
  minCount: number;
  setMinCount: (count: number) => void;
  maxCount: number;
  viewMode: 'chart' | 'list';
  setViewMode: (mode: 'chart' | 'list') => void;
  totalLabels: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const FilterControls = ({
  minCount,
  setMinCount,
  maxCount,
  viewMode,
  setViewMode,
  totalLabels,
  searchQuery,
  setSearchQuery,
}: FilterControlsProps) => {
  return (
    <motion.div 
      className="bg-card rounded-lg p-4 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 space-y-4">
          <div>
            <label htmlFor="searchQuery" className="block text-sm font-medium mb-1">
              Search labels or mixes
            </label>
            <input
              type="text"
              id="searchQuery"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for labels or DJ mixes..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label htmlFor="minCount" className="block text-sm font-medium mb-1">
              Minimum appearances: {minCount}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                id="minCount"
                min="1"
                max={maxCount}
                value={minCount}
                onChange={(e) => setMinCount(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Showing {totalLabels} labels</span>
          <div className="flex bg-card border border-gray-700 rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1 text-sm ${viewMode === 'chart' ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              Chart
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-sm ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              List
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FilterControls;