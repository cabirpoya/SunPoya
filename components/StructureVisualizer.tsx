import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { SongSection } from '../types';

interface StructureVisualizerProps {
  sections: SongSection[];
  isPlaying: boolean;
  tempo: number;
  onComplete: () => void;
}

const StructureVisualizer: React.FC<StructureVisualizerProps> = ({ sections, isPlaying, tempo, onComplete }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<number>();
  
  // Calculate total bars
  const totalBars = sections.reduce((acc, curr) => acc + curr.bars, 0);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scale
    const xScale = d3.scaleLinear()
      .domain([0, totalBars])
      .range([0, innerWidth]);

    // Color scale for sections
    const colorScale = d3.scaleOrdinal()
      .domain(sections.map(s => s.name))
      .range(["#4f46e5", "#06b6d4", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b"]);

    let currentBar = 0;

    // Draw sections
    sections.forEach((section, index) => {
      const barWidth = xScale(section.bars) - xScale(0);
      const startX = xScale(currentBar);

      // Group for section
      const sectionG = g.append("g")
        .attr("class", "section-group");

      // Background rect
      sectionG.append("rect")
        .attr("x", startX)
        .attr("y", 40)
        .attr("width", barWidth - 2) // Gap
        .attr("height", 80)
        .attr("rx", 6)
        .attr("fill", colorScale(section.name) as string)
        .attr("opacity", 0.8)
        .attr("class", "transition-all duration-300 hover:opacity-100 cursor-pointer");

      // Label
      sectionG.append("text")
        .attr("x", startX + barWidth / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("fill", "#e2e8f0")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .text(section.name);

      // Chords (simplified)
      section.chords.forEach((chord, i) => {
        if (i < 4) { // Show max 4 chords per section preview
           sectionG.append("text")
            .attr("x", startX + (barWidth / (Math.min(section.chords.length, 4))) * i + 5)
            .attr("y", 85)
            .attr("fill", "white")
            .attr("font-size", "10px")
            .attr("opacity", 0.7)
            .text(chord);
        }
      });
      
      // Instruments (tooltip-ish)
      sectionG.append("title")
        .text(`${section.name}\n${section.bars} Bars\nInstruments: ${section.instruments.join(', ')}\n${section.description}`);

      currentBar += section.bars;
    });

    // Axis
    const xAxis = d3.axisBottom(xScale).ticks(totalBars / 4).tickFormat(d => `Bar ${d}`);
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight + 20})`)
      .call(xAxis)
      .attr("color", "#64748b");

    // Playhead line
    const playhead = g.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", innerHeight + 30)
      .attr("stroke", "#fbbf24") // Amber-400
      .attr("stroke-width", 2)
      .attr("id", "playhead");

  }, [sections, totalBars]); // Redraw when data changes

  // Animation Logic
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    
    // Calculate duration in ms. 
    // 1 bar = 4 beats (assuming 4/4 mostly). 
    // BPM = Beats Per Minute. 
    // Seconds per beat = 60 / BPM.
    // Seconds per bar = (60 / BPM) * 4.
    const secondsPerBar = (60 / tempo) * 4;
    const totalDurationMs = totalBars * secondsPerBar * 1000;

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp - (progress * totalDurationMs);
      const elapsed = timestamp - startTime;
      const newProgress = Math.min(elapsed / totalDurationMs, 1);
      
      setProgress(newProgress);

      const width = containerRef.current?.clientWidth || 0;
      const margin = { left: 20, right: 20 };
      const innerWidth = width - margin.left - margin.right;
      
      const currentX = newProgress * innerWidth;

      d3.select("#playhead")
        .attr("transform", `translate(${currentX}, 0)`);

      if (newProgress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        onComplete();
        setProgress(0);
        d3.select("#playhead").attr("transform", `translate(0, 0)`);
      }
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
        if(animationRef.current) cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, totalBars, tempo, onComplete, sections]); // Removed 'progress' from dependency to avoid loop re-triggering logic incorrectly

  return (
    <div ref={containerRef} className="w-full h-[220px] bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden relative">
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};

export default StructureVisualizer;
