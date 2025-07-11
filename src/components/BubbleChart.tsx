'use client';

import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { LabelData } from '@/types';

interface BubbleChartProps {
  labelsData: Record<string, LabelData>;
  onLabelClick: (labelName: string) => void;
  selectedLabel: string | null;
}

interface BubbleNode extends d3.SimulationNodeDatum {
  id: string;
  value: number;
  radius: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

const BubbleChart = ({ labelsData, onLabelClick, selectedLabel }: BubbleChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const fixedTooltipRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [mixesVisible, setMixesVisible] = useState<boolean>(false);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  
  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const containerWidth = svgRef.current.parentElement?.clientWidth || 800;
        setDimensions({
          width: containerWidth,
          height: Math.min(window.innerHeight * 0.7, 600)
        });
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // D3 bubble chart
  useEffect(() => {
    if (!svgRef.current || Object.keys(labelsData).length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Create container for zoom/pan
    const svg = d3.select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);
      
    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
        // Update label visibility when zoom changes
        updateLabelVisibility();
      });
    
    svg.call(zoom);
    
    // Create container for all elements
    const container = svg.append('g')
      .attr('class', 'container');
      
    // Create bubble data
    const data = Object.entries(labelsData).map(([name, data]) => ({
      id: name,
      value: data.count
    }));
    
    // Size scale for bubbles
    const maxCount = Math.max(...data.map(d => d.value));
    const minRadius = 15;
    const maxRadius = 60;
    
    const radiusScale = d3.scaleSqrt()
      .domain([1, maxCount])
      .range([minRadius, maxRadius]);
    
    // Create nodes with radius
    const nodes: BubbleNode[] = data.map(d => ({
      ...d,
      radius: radiusScale(d.value)
    }));
    
    // Color scale
    const colorScale = d3.scaleSequential()
      .domain([1, maxCount])
      .interpolator(d3.interpolateViridis);
    
    // Create simulation
    const simulation = d3.forceSimulation<BubbleNode>(nodes)
      .force('charge', d3.forceManyBody().strength(5))
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collision', d3.forceCollide().radius(d => (d.radius || 0) + 2))
      .on('tick', ticked);
    
    // Create bubble groups
    const bubbles = container.selectAll('.bubble')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'bubble')
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        // Update fixed tooltip in top-left corner
        if (fixedTooltipRef.current) {
          d3.select(fixedTooltipRef.current)
            .style('opacity', 1)
            .html(`
              <div class="font-medium">${d.id}</div>
              <div class="text-sm">${d.value} appearances</div>
            `);
        }
        
        // Add stroke to highlight the bubble without dimming others
        d3.select(this).select('circle')
          .transition()
          .duration(300)
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2);
          
        setHoveredLabel(d.id);
      })
      .on('mouseout', function() {
        // Hide fixed tooltip
        if (fixedTooltipRef.current) {
          d3.select(fixedTooltipRef.current)
            .style('opacity', 0);
        }
        
        // Remove stroke unless it's the selected label
        d3.select(this).select('circle')
          .transition()
          .duration(300)
          .attr('stroke', d => d.id === selectedLabel ? '#ffffff' : 'none')
          .attr('stroke-width', d => d.id === selectedLabel ? 2 : 0);
          
        setHoveredLabel(null);
      })
      .on('click', (_, d) => {
        onLabelClick(d.id);
        setShowPopup(true);
        setMixesVisible(true);
      });
    
    // Add circles to groups
    bubbles.append('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => colorScale(d.value))
      .attr('stroke', d => d.id === selectedLabel ? '#ffffff' : 'none')
      .attr('stroke-width', d => d.id === selectedLabel ? 2 : 0)
      .attr('fill-opacity', 0.7)
      .transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .attr('fill-opacity', 0.9);
    
    // Add labels to groups
    bubbles.append('text')
      .text(d => d.id)
      .attr('text-anchor', 'middle')
      .attr('dy', '.3em')
      .style('fill', '#ffffff')
      .style('font-size', d => `${Math.min(d.radius / 3 + 8, 14)}px`)
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .transition()
      .duration(800)
      .style('opacity', d => d.radius > 25 ? 1 : 0);
      
    // Update label visibility on zoom
    const updateLabelVisibility = () => {
      bubbles.selectAll('text')
        .style('opacity', d => (d.radius * zoomLevel > 25) ? 1 : 0);
    };
    
    // Watch for zoom level changes
    updateLabelVisibility();
    
    // Update positions on tick
    function ticked() {
      bubbles.attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);
    }
    
    // Apply zoom behavior
    svg.call(zoom);
    
    // Highlight selected label
    if (selectedLabel) {
      bubbles.filter(d => d.id === selectedLabel)
        .raise()
        .select('circle')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2);
    }
    
    return () => {
      simulation.stop();
    };
  }, [labelsData, dimensions, selectedLabel, onLabelClick]);

  // Get mixes for selected label
  const selectedLabelMixes = selectedLabel && labelsData[selectedLabel]?.mixes || [];

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-lg bg-card">
        {/* Fixed tooltip in top-left corner */}
        <div 
          ref={fixedTooltipRef}
          className="absolute top-4 left-4 pointer-events-none bg-card p-2 rounded-md shadow-lg text-white opacity-0 transition-opacity z-10"
          style={{ minWidth: '120px' }}
        />
        
        <svg 
          ref={svgRef} 
          className="w-full"
          style={{ minHeight: '500px' }}
        />
        
        {/* Floating tooltip (hidden now, keeping for reference) */}
        <div 
          ref={tooltipRef}
          className="absolute pointer-events-none bg-card p-2 rounded-md shadow-lg text-white opacity-0 transition-opacity z-10 hidden"
          style={{ 
            top: 0, 
            left: 0,
            minWidth: '120px',
            transform: 'translate(-50%, -100%)'
          }}
        />
      </div>
      
      {/* Centered popup for selected label */}
      <AnimatePresence>
        {selectedLabel && showPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
            onClick={() => setShowPopup(false)}
          >
            <motion.div 
              className="bg-card rounded-lg p-6 shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-primary">{selectedLabel}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm bg-primary/20 text-primary px-2 py-1 rounded-full">
                  {labelsData[selectedLabel]?.count} appearances
                </span>
                <button 
                  onClick={() => setMixesVisible(!mixesVisible)}
                  className="text-sm bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded-full transition-colors"
                >
                  {mixesVisible ? 'Hide mixes' : 'Show mixes'}
                </button>
                <button
                  onClick={() => setShowPopup(false)}
                  className="text-sm bg-gray-700 hover:bg-gray-600 p-1 rounded-full transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <AnimatePresence>
              {mixesVisible && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2"
                >
                  <h4 className="text-sm font-medium mb-2">Appears in {selectedLabelMixes.length} mixes:</h4>
                  <div className="max-h-60 overflow-y-auto pr-2 space-y-1">
                    {selectedLabelMixes.map((mix, index) => {
                      // Extract mix name from URL
                      const mixName = mix.split('/').pop()?.replace(/_/g, ' ') || mix;
                      
                      return (
                        <motion.a
                          key={index}
                          href={mix}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-blue-400 hover:text-blue-300 truncate"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                        >
                          {mixName}
                        </motion.a>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
              </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BubbleChart;