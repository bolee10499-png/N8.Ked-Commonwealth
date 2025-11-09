import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Save, Play, Trash2, GitBranch, Zap, Database, Send } from 'lucide-react';

const NODE_TYPES = {
  trigger: { name: 'Trigger', icon: Zap, color: '#ff0000', options: ['Webhook', 'Schedule', 'Manual', 'API Request', 'Email'] },
  condition: { name: 'Condition', icon: GitBranch, color: '#ffff00', options: ['If/Else', 'Switch', 'Filter', 'Compare'] },
  action: { name: 'Action', icon: Send, color: '#00ff00', options: ['HTTP Request', 'Send Email', 'AI Process', 'Database'] },
  data: { name: 'Data', icon: Database, color: '#00ffff', options: ['Get Market Data', 'Parse JSON', 'Transform', 'Calculate'] }
};

export default function WorkflowCanvas({ user }) {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [dragNode, setDragNode] = useState(null);

  const addNode = useCallback((type) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type,
      x: 100 + (nodes.length % 5) * 200,
      y: 100 + Math.floor(nodes.length / 5) * 150,
      config: { action: NODE_TYPES[type].options[0], params: {} }
    };
    setNodes(prev => [...prev, newNode]);
  }, [nodes.length]);

  const deleteNode = useCallback((id) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
    if (selectedNode?.id === id) setSelectedNode(null);
  }, [selectedNode]);

  const saveWorkflow = async () => {
    const workflow = { name: workflowName, nodes, connections, created: Date.now() };
    
    try {
      await fetch('http://localhost:5000/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(workflow)
      });
      alert('✅ Workflow saved!');
    } catch (e) {
      alert('❌ Error saving workflow');
    }
  };

  const runWorkflow = async () => {
    try {
      await fetch('http://localhost:5000/api/workflows/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ nodes, connections })
      });
      alert('✅ Workflow executed!');
    } catch (e) {
      alert('❌ Error running workflow');
    }
  };

  const onNodeDragStart = (e, node) => {
    setDragNode(node);
  };

  const onNodeDrag = (e) => {
    if (!dragNode) return;
    const updated = nodes.map(n =>
      n.id === dragNode.id ? { ...n, x: e.clientX - 100, y: e.clientY - 100 } : n
    );
    setNodes(updated);
  };

  const onNodeDragEnd = () => {
    setDragNode(null);
  };

  return (
    <div className="h-full flex flex-col p-8" onMouseMove={onNodeDrag} onMouseUp={onNodeDragEnd}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <input
          value={workflowName}
          onChange={e => setWorkflowName(e.target.value)}
          className="text-3xl font-bold bg-transparent border-none outline-none border-b-2 border-demon-red/50 focus:border-demon-red"
          placeholder="Workflow Name"
        />
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={saveWorkflow}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-demon-red to-red-700 flex items-center gap-2 hover-force"
          >
            <Save size={20} /> Save
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={runWorkflow}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 flex items-center gap-2 hover-force"
          >
            <Play size={20} /> Run
          </motion.button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {Object.entries(NODE_TYPES).map(([key, type]) => {
          const Icon = type.icon;
          return (
            <motion.button
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => addNode(key)}
              className="px-4 py-3 rounded-xl flex items-center gap-2 flex-shrink-0 liquid-glass hover-force"
              style={{ borderLeft: `4px solid ${type.color}` }}
            >
              <Icon size={20} style={{ color: type.color }} />
              <span className="font-medium">{type.name}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Canvas */}
      <div className="flex-1 liquid-glass rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,0,0,0.1) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}>
          {/* Render Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connections.map((conn, i) => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;

              return (
                <line
                  key={i}
                  x1={fromNode.x + 110}
                  y1={fromNode.y + 50}
                  x2={toNode.x + 110}
                  y2={toNode.y + 50}
                  stroke="#ff0000"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              );
            })}
          </svg>

          {/* Render Nodes */}
          {nodes.map(node => {
            const type = NODE_TYPES[node.type];
            const Icon = type.icon;
            const isSelected = selectedNode?.id === node.id;

            return (
              <motion.div
                key={node.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{ left: node.x, top: node.y }}
                className={`absolute w-56 p-4 rounded-xl cursor-move transition-all ${
                  isSelected ? 'ring-2 ring-demon-red' : ''
                }`}
                onMouseDown={(e) => onNodeDragStart(e, node)}
                onClick={() => setSelectedNode(node)}
              >
                <div className="liquid-glass rounded-xl p-4" style={{ borderLeft: `4px solid ${type.color}` }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon size={18} style={{ color: type.color }} />
                      <span className="font-bold text-sm">{type.name}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNode(node.id);
                      }}
                      className="text-red-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="text-xs text-gray-400">{node.config.action}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Config Panel */}
      {selectedNode && (
        <motion.div
          initial={{ x: 300 }}
          animate={{ x: 0 }}
          className="fixed right-0 top-20 w-80 h-[calc(100vh-80px)] liquid-glass border-l border-demon-red/20 p-6"
        >
          <h3 className="text-xl font-bold mb-4">Configure Node</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Action Type</label>
              <select
                value={selectedNode.config.action}
                onChange={(e) => {
                  const updated = nodes.map(n =>
                    n.id === selectedNode.id
                      ? { ...n, config: { ...n.config, action: e.target.value } }
                      : n
                  );
                  setNodes(updated);
                  setSelectedNode({ ...selectedNode, config: { ...selectedNode.config, action: e.target.value } });
                }}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-demon-red/50"
              >
                {NODE_TYPES[selectedNode.type].options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}