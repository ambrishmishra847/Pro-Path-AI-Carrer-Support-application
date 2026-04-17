import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import * as THREE from 'three';
import anime from 'animejs';
import { 
  ArrowLeft, 
  Rocket, 
  Target, 
  Map as MapIcon, 
  ChevronRight, 
  Sparkles, 
  Loader2,
  Brain,
  Flag,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import { cn } from '../lib/utils';

export default function CareerRoadmap({ user }) {
  const navigate = useNavigate();
  const d3Container = useRef(null);
  const threeContainer = useRef(null);
  const [currentRole, setCurrentRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // Three.js Background Effect
  useEffect(() => {
    if (!threeContainer.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    threeContainer.current.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 5000; i++) {
      vertices.push(THREE.MathUtils.randFloatSpread(2000)); // x
      vertices.push(THREE.MathUtils.randFloatSpread(2000)); // y
      vertices.push(THREE.MathUtils.randFloatSpread(2000)); // z
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    const material = new THREE.PointsMaterial({ color: 0x3b82f6, size: 2, transparent: true, opacity: 0.5 });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    camera.position.z = 500;

    const animate = () => {
      requestAnimationFrame(animate);
      points.rotation.x += 0.0005;
      points.rotation.y += 0.0005;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    const container = threeContainer.current;

    return () => {
      window.removeEventListener('resize', handleResize);
      if (container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const generateRoadmap = async () => {
    if (!currentRole || !targetRole) return;
    setLoading(true);
    setRoadmap(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Generate a career roadmap from "${currentRole}" to "${targetRole}". 
      Provide a structured JSON response with a list of "milestones". 
      Each milestone should have:
      - id: unique string
      - title: string
      - description: string
      - difficulty: number (1-10)
      - estimatedTime: string
      - skillsToAcquire: array of strings
      - projectIdea: string
      
      Return ONLY the JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              milestones: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    difficulty: { type: Type.NUMBER },
                    estimatedTime: { type: Type.STRING },
                    skillsToAcquire: { type: Type.ARRAY, items: { type: Type.STRING } },
                    projectIdea: { type: Type.STRING }
                  },
                  required: ["id", "title", "description", "difficulty", "estimatedTime", "skillsToAcquire", "projectIdea"]
                }
              }
            },
            required: ["milestones"]
          }
        }
      });

      const data = JSON.parse(response.text);
      setRoadmap(data.milestones);
      renderD3Roadmap(data.milestones);
    } catch (err) {
      console.error("Roadmap generation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderD3Roadmap = (milestones) => {
    if (!d3Container.current) return;
    d3.select(d3Container.current).selectAll("*").remove();

    const width = d3Container.current.clientWidth;
    const height = 400;
    const svg = d3.select(d3Container.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain([0, milestones.length - 1])
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain([0, 10])
      .range([innerHeight, 0]);

    // Draw path
    const line = d3.line()
      .x((d, i) => x(i))
      .y(d => y(d.difficulty))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(milestones)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 4)
      .attr("stroke-dasharray", function() {
        const length = this.getTotalLength();
        return `${length} ${length}`;
      })
      .attr("stroke-dashoffset", function() {
        return this.getTotalLength();
      })
      .transition()
      .duration(2000)
      .attr("stroke-dashoffset", 0)
      .attr("d", line);

    // Draw nodes
    const nodes = g.selectAll(".node")
      .data(milestones)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d, i) => `translate(${x(i)},${y(d.difficulty)})`)
      .style("cursor", "pointer")
      .on("click", (event, d) => setSelectedNode(d));

    nodes.append("circle")
      .attr("r", 0)
      .attr("fill", "#fff")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 3)
      .transition()
      .delay((d, i) => i * 300)
      .duration(500)
      .attr("r", 12);

    nodes.append("text")
      .attr("dy", -20)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("fill", "#1e293b")
      .text(d => d.title)
      .style("opacity", 0)
      .transition()
      .delay((d, i) => i * 300 + 500)
      .duration(500)
      .style("opacity", 1);

    // Anime.js for node pulsing
    anime({
      targets: '.node circle',
      scale: [1, 1.2],
      duration: 1000,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutQuad',
      delay: anime.stagger(200)
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Three.js Background */}
      <div ref={threeContainer} className="fixed inset-0 pointer-events-none opacity-20" />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <header className="mb-12">
          <button 
            onClick={() => navigate('/')}
            className="mb-6 p-2 hover:bg-white rounded-xl transition-all flex items-center gap-2 text-slate-600 font-semibold"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
              <MapIcon size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Career Roadmap</h1>
              <p className="text-slate-600">Visualize your journey from where you are to where you want to be.</p>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <section className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white shadow-2xl shadow-blue-100/50">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Rocket className="text-blue-600" size={20} />
                Set Your Destination
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Current Role</label>
                  <input 
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    placeholder="e.g. Junior Web Developer"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Target Role</label>
                  <input 
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Senior Software Architect"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <button
                  onClick={generateRoadmap}
                  disabled={loading || !currentRole || !targetRole}
                  className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                  Generate My Roadmap
                </button>
              </div>
            </section>

            {selectedNode && (
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-500/30">
                      Milestone Details
                    </span>
                    <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white">
                      <Zap size={16} />
                    </button>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{selectedNode.title}</h3>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">{selectedNode.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Difficulty</p>
                      <p className="text-lg font-bold text-blue-400">{selectedNode.difficulty}/10</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Est. Time</p>
                      <p className="text-lg font-bold text-purple-400">{selectedNode.estimatedTime}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase mb-2">Skills to Acquire</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedNode.skillsToAcquire.map(skill => (
                          <span key={skill} className="px-3 py-1 bg-white/10 rounded-lg text-xs font-medium">{skill}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase mb-2">Project Idea</p>
                      <div className="p-4 bg-blue-600/20 rounded-2xl border border-blue-500/30 text-sm italic">
                        "{selectedNode.projectIdea}"
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Brain size={120} />
                </div>
              </motion.section>
            )}
          </div>

          <div className="lg:col-span-2">
            <section className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white shadow-2xl shadow-blue-100/50 min-h-[600px] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Target className="text-blue-600" size={20} />
                  Visual Roadmap
                </h2>
                {roadmap && (
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-blue-600" />
                      Learning Path
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full border-2 border-blue-600" />
                      Milestone
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 relative">
                {!roadmap && !loading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                    <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
                      <MapIcon size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-400 mb-2">No Roadmap Generated</h3>
                    <p className="text-slate-400 max-w-xs">Enter your current and target roles to see your personalized career path visualized here.</p>
                  </div>
                )}

                {loading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                    <p className="text-slate-500 font-bold animate-pulse">Gemini is mapping your future...</p>
                  </div>
                )}

                <div ref={d3Container} className="w-full h-full" />
              </div>

              {roadmap && (
                <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Steps</p>
                    <p className="text-2xl font-black text-slate-900">{roadmap.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Avg. Difficulty</p>
                    <p className="text-2xl font-black text-slate-900">
                      {(roadmap.reduce((acc, curr) => acc + curr.difficulty, 0) / roadmap.length).toFixed(1)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Skills to Master</p>
                    <p className="text-2xl font-black text-slate-900">
                      {new Set(roadmap.flatMap(m => m.skillsToAcquire)).size}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Next Goal</p>
                    <p className="text-sm font-bold text-blue-600 truncate px-2">{roadmap[0].title}</p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
