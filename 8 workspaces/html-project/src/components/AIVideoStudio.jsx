import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Wand2, Download, Sparkles } from 'lucide-react';

export default function AIVideoStudio({ user }) {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const tools = [
    { name: 'Luma AI', desc: 'Dream Machine video generation', url: 'https://lumalabs.ai/dream-machine' },
    { name: 'Veed.io', desc: 'Image to Video AI', url: 'https://veed.io/tools/image-to-video-ai' },
    { name: 'Akool', desc: 'AI Video Generator', url: 'https://akool.com/apps/image-to-video' },
    { name: 'GenApe', desc: 'AI Video Studio', url: 'https://app.genape.ai/ai-video-generator' }
  ];

  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
  };

  const generateVideo = async () => {
    setProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setResult('https://example.com/generated-video.mp4');
      setProcessing(false);
    }, 3000);
  };

  return (
    <div className="h-full p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-demon-red to-red-500 bg-clip-text text-transparent">
          AI Video Studio
        </h2>
        <p className="text-gray-500">Create stunning videos with AI</p>
      </motion.div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="liquid-glass rounded-2xl p-8"
      >
        <div className="border-2 border-dashed border-demon-red/30 rounded-xl p-12 text-center hover-force cursor-pointer">
          <input type="file" onChange={handleFileUpload} className="hidden" id="file-upload" accept="image/*,video/*" />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload size={48} className="mx-auto mb-4 text-demon-red" />
            <p className="text-lg font-semibold mb-2">Upload Image or Video</p>
            <p className="text-sm text-gray-500">Drag and drop or click to browse</p>
            {file && <p className="mt-4 text-green-500">✓ {file.name}</p>}
          </label>
        </div>
      </motion.div>

      {/* Prompt Input */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="liquid-glass rounded-2xl p-6"
      >
        <label className="text-sm text-gray-400 mb-2 block">AI Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want to create..."
          className="w-full h-32 px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-demon-red/50 resize-none"
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateVideo}
          disabled={!file || !prompt || processing}
          className="mt-4 w-full py-4 rounded-xl bg-gradient-to-r from-demon-red to-red-700 flex items-center justify-center gap-2 hover-force disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? (
            <>
              <Sparkles size={20} className="animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Wand2 size={20} />
              <span>Generate Video</span>
            </>
          )}
        </motion.button>
      </motion.div>

      {/* AI Tools Grid */}
      <div className="grid grid-cols-2 gap-4">
        {tools.map((tool, i) => (
          <motion.a
            key={tool.name}
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="liquid-glass rounded-xl p-6 hover-force"
          >
            <h3 className="font-bold text-lg mb-2">{tool.name}</h3>
            <p className="text-sm text-gray-500">{tool.desc}</p>
          </motion.a>
        ))}
      </div>

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="liquid-glass rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold mb-4">Generated Video</h3>
          <video controls className="w-full rounded-xl mb-4" src={result} />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center gap-2 hover-force"
          >
            <Download size={20} />
            <span>Download Video</span>
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}