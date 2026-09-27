import React, { useState, useEffect } from 'react';
import {
  Brain,
  Search,
  FolderTree,
  ChevronRight,
  ChevronDown,
  Cpu,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  Layers,
  RefreshCw
} from 'lucide-react';
import type { MemoryNode, Machine } from '../types';
import { api } from '../services/api';

interface MemoryBankViewProps {
  machines: Machine[];
  onSelectMachineCode?: (code: string) => void;
}

export const MemoryBankView: React.FC<MemoryBankViewProps> = ({
  machines,
}) => {
  const [selectedMachineFilter, setSelectedMachineFilter] = useState<string>('all');
  const [treeData, setTreeData] = useState<MemoryNode | null>(null);
  const [loadingTree, setLoadingTree] = useState<boolean>(true);

  // Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [searching, setSearching] = useState<boolean>(false);

  // Expanded nodes set
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));

  const fetchTree = async () => {
    setLoadingTree(true);
    try {
      const data = await api.getMemoryTree(
        selectedMachineFilter === 'all' ? undefined : selectedMachineFilter
      );
      setTreeData(data);
      const initialExpanded = new Set<string>(['root']);
      data.children?.forEach((child) => {
        initialExpanded.add(child.id);
        child.children?.forEach((grandchild) => {
          initialExpanded.add(grandchild.id);
        });
      });
      setExpandedNodes(initialExpanded);
    } catch (err) {
      console.error('Failed to load memory tree', err);
    } finally {
      setLoadingTree(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, [selectedMachineFilter]);

  const toggleNode = (nodeId: string) => {
    const next = new Set(expandedNodes);
    if (next.has(nodeId)) {
      next.delete(nodeId);
    } else {
      next.add(nodeId);
    }
    setExpandedNodes(next);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    try {
      const res = await api.searchMemories(
        searchQuery,
        selectedMachineFilter === 'all' ? undefined : selectedMachineFilter
      );
      setSearchResults(res.results || []);
    } catch (err) {
      console.error('Memory search error', err);
    } finally {
      setSearching(false);
    }
  };

  const renderTreeNode = (node: MemoryNode, depth = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    let icon = <Brain className="w-3.5 h-3.5 text-[#3e6b5c]" />;
    let badgeColor = 'bg-[#e3ece6] text-[#3e6b5c] border-[#3e6b5c]/30';

    if (node.type === 'machine_type') {
      icon = <Layers className="w-3.5 h-3.5 text-[#d36d4e]" />;
      badgeColor = 'bg-[#f6e4de] text-[#d36d4e] border-[#d36d4e]/30';
    } else if (node.type === 'machine') {
      icon = <Cpu className="w-3.5 h-3.5 text-[#df9e52]" />;
      badgeColor = 'bg-[#fbf1e2] text-[#df9e52] border-[#df9e52]/30';
    } else if (node.type === 'incident') {
      icon = <AlertTriangle className="w-3.5 h-3.5 text-[#d36d4e]" />;
      badgeColor = 'bg-[#f6e4de] text-[#d36d4e] border-[#d36d4e]/30';
    } else if (node.type === 'diagnostic_attempt') {
      icon = <WrenchIcon className="w-3.5 h-3.5 text-[#647482]" />;
      badgeColor = 'bg-[#faf7f2] text-[#647482] border-[#e4dbcd]';
    } else if (node.type === 'failed_approach') {
      icon = <XCircle className="w-3.5 h-3.5 text-[#d36d4e]" />;
      badgeColor = 'bg-[#faeae4] text-[#d36d4e] border-[#d36d4e]/30';
    } else if (node.type === 'successful_action') {
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-[#3e6b5c]" />;
      badgeColor = 'bg-[#e3ece6] text-[#3e6b5c] border-[#3e6b5c]/30';
    } else if (node.type === 'lesson_learned') {
      icon = <Lightbulb className="w-3.5 h-3.5 text-[#df9e52]" />;
      badgeColor = 'bg-[#fbf1e2] text-[#df9e52] border-[#df9e52]/30';
    }

    return (
      <div key={node.id} className="select-none">
        <div
          onClick={() => hasChildren && toggleNode(node.id)}
          className={`flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-xs cursor-pointer hover:bg-[#faf7f2] transition-colors ${
            depth === 0 ? 'font-bold text-[#182026]' : 'text-[#4e5b67]'
          }`}
          style={{ paddingLeft: `${depth * 18 + 8}px` }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-[#8a96a3] flex-shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-[#8a96a3] flex-shrink-0" />
            )
          ) : (
            <span className="w-3.5 flex-shrink-0" />
          )}

          <div className="flex-shrink-0">{icon}</div>

          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border uppercase font-medium ${badgeColor}`}>
            {node.type.replace('_', ' ')}
          </span>

          <span className="truncate font-medium text-[#182026]">
            {node.name || node.code || node.id}
          </span>

          {node.count !== undefined && (
            <span className="text-[10px] text-[#8a96a3] font-mono ml-auto">
              ({node.count} {node.count === 1 ? 'item' : 'items'})
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-[#ece4d6] ml-3 pl-1">
            {node.children!.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fbf1e2] border border-[#df9e52]/30 text-[#df9e52] text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hindsight Persistent Memory Bank: org_byte4_default</span>
          </div>
          <h1 className="font-serif font-normal text-2xl sm:text-3xl text-[#182026] tracking-tight">
            Organizational Knowledge & Memory Graph
          </h1>
          <p className="text-xs text-[#717b85] mt-1">
            Permanent institutional intelligence: Every repair, successful fix, and failed action indexed across all assets
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedMachineFilter}
            onChange={(e) => setSelectedMachineFilter(e.target.value)}
            className="bg-white px-3 py-2 rounded-xl text-xs text-[#182026] border border-[#e4dcce] focus:outline-none focus:border-[#d36d4e]"
          >
            <option value="all">All Facility Assets</option>
            {machines.map((m) => (
              <option key={m.id} value={m.machine_code}>
                {m.machine_code} - {m.name}
              </option>
            ))}
          </select>

          <button
            onClick={fetchTree}
            className="p-2 rounded-xl bg-white hover:bg-[#faf7f2] text-[#182026] border border-[#e4dcce]"
            title="Refresh Memory Tree"
          >
            <RefreshCw className={`w-4 h-4 ${loadingTree ? 'animate-spin text-[#d36d4e]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Semantic Memory Search Bar */}
      <div className="ui-card rounded-2xl p-5 border border-[#e4dcce] bg-white shadow-xs">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#8a96a3] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search organizational memory (e.g., 'bearing overheating at high speed', 'cavitation', 'valve hunting')..."
              className="w-full bg-[#faf7f2] pl-10 pr-4 py-2 rounded-xl text-xs text-[#182026] border border-[#e4dbcd] focus:outline-none focus:border-[#d36d4e]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="submit"
              disabled={searching}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-[#d36d4e] hover:bg-[#c25838] text-white text-xs font-semibold shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              {searching ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-[#fbf1e2]" />
              )}
              <span>Query Memory Bank</span>
            </button>

            {searchResults && (
              <button
                type="button"
                onClick={() => {
                  setSearchResults(null);
                  setSearchQuery('');
                }}
                className="px-3 py-2 rounded-xl bg-[#faf7f2] hover:bg-[#ede5d8] text-[#717b85] text-xs"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Quick query chips */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[#717b85]">
          <span className="font-semibold text-[#8a96a3]">Try queries:</span>
          {['bearing harmonic vibration', 'impeller seal cavitation', 'hydraulic proportional filter', 'spindle thermal runaway'].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setSearchQuery(q)}
              className="px-2.5 py-0.5 rounded-full bg-[#faf7f2] hover:bg-[#f6e4de] text-[#4e5b67] hover:text-[#d36d4e] border border-[#e4dcce] transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Semantic Search Results (if active) */}
      {searchResults && (
        <div className="ui-card rounded-2xl p-6 border border-[#d36d4e]/30 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#182026] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#d36d4e]" />
              <span>Semantic Memory Matches ({searchResults.length} Found)</span>
            </h3>
            <span className="text-xs font-mono text-[#d36d4e]">Query: "{searchQuery}"</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {searchResults.length === 0 ? (
              <p className="text-xs text-[#717b85] italic col-span-2 py-4 text-center">
                No direct memory entries matched this specific phrase. Try querying general keywords like "bearing", "vibration", or "hydraulic".
              </p>
            ) : (
              searchResults.map((res, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-[#faf7f2] border border-[#ece4d6] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#f6e4de] text-[#d36d4e]">
                        {res.machine_code || 'Asset'}
                      </span>
                      {res.incident_number && (
                        <span className="font-mono text-[10px] text-[#8a96a3]">
                          {res.incident_number}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#182026] leading-relaxed font-medium">
                      {res.text || res.content_summary || res.summary}
                    </p>
                  </div>
                  {res.memory_type && (
                    <span className="text-[10px] uppercase font-bold text-[#3e6b5c] mt-2 block">
                      Type: {res.memory_type}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Hierarchical Memory Tree Explorer */}
      <div className="ui-card rounded-2xl p-6 border border-[#e4dcce] bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-[#f1ebdF]">
          <div>
            <h2 className="text-base font-bold text-[#182026] flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-[#3e6b5c]" />
              <span>Hierarchical Knowledge Tree</span>
            </h2>
            <p className="text-xs text-[#717b85] mt-0.5">
              Asset Class &rarr; Equipment ID &rarr; Incident &rarr; Diagnostic Hypotheses &rarr; Failed Actions &rarr; Permanent Fixes
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (treeData) {
                  const all = new Set<string>(['root']);
                  const addAll = (n: MemoryNode) => {
                    all.add(n.id);
                    n.children?.forEach(addAll);
                  };
                  addAll(treeData);
                  setExpandedNodes(all);
                }
              }}
              className="px-2.5 py-1 rounded-xl bg-[#faf7f2] hover:bg-[#ede5d8] text-[#717b85] text-xs border border-[#e4dcce]"
            >
              Expand All
            </button>
            <button
              onClick={() => setExpandedNodes(new Set(['root']))}
              className="px-2.5 py-1 rounded-xl bg-[#faf7f2] hover:bg-[#ede5d8] text-[#717b85] text-xs border border-[#e4dcce]"
            >
              Collapse
            </button>
          </div>
        </div>

        {loadingTree ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <div className="w-7 h-7 border-2 border-[#3e6b5c]/30 border-t-[#3e6b5c] rounded-full animate-spin" />
            <span className="text-xs text-[#717b85]">Loading memory hierarchy...</span>
          </div>
        ) : treeData ? (
          <div className="space-y-0.5 max-h-[600px] overflow-y-auto pr-2">
            {renderTreeNode(treeData)}
          </div>
        ) : (
          <p className="text-xs text-[#8a96a3] py-6 text-center">Unable to load memory tree.</p>
        )}
      </div>
    </div>
  );
};

function WrenchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}
