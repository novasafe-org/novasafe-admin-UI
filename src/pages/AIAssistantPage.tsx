import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, RefreshCw, Wand2 } from "lucide-react";

const tones = ["Professional", "Casual", "Technical", "Creative"];

const suggestions = [
  "Write a blog post about the future of AI in content marketing",
  "Create an SEO-optimized article about remote work productivity",
  "Generate 10 headline ideas for a startup launch announcement",
  "Write a product comparison guide between popular CMS platforms",
];

export default function AIAssistantPage() {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Professional");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = () => {
    if (!prompt) return;
    setLoading(true);
    // Simulate AI generation
    setTimeout(() => {
      setOutput(`# ${prompt}\n\nThis is AI-generated content based on your prompt. In a production environment, this would connect to an AI service to generate real content.\n\n## Key Points\n\n- Point one covering the main topic\n- Analysis of current trends and developments\n- Actionable insights and recommendations\n- Data-driven conclusions\n\n## Detailed Analysis\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. The ${tone.toLowerCase()} tone has been applied to match your preferred writing style.\n\n## Conclusion\n\nThis generated content provides a solid foundation that you can refine and customize to match your brand voice.`);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">AI Assistant</h1>
          <p className="text-sm text-muted-foreground">Generate, rewrite, and optimize your content</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl shadow-card p-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Tone</label>
              <div className="flex gap-1.5 flex-wrap">
                {tones.map((t) => (
                  <button key={t} onClick={() => setTone(t)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tone === t ? "gradient-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to generate..."
                rows={5}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/20 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generate}
                disabled={loading || !prompt}
                className="px-4 py-2 rounded-md gradient-primary text-primary-foreground font-medium text-sm shadow-primary hover:shadow-primary-hover transition-shadow flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {loading ? "Generating..." : "Generate"}
              </motion.button>
            </div>
          </motion.div>

          {/* Quick prompts */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl shadow-card p-5">
            <h3 className="text-sm font-medium text-card-foreground mb-3 flex items-center gap-1.5">
              <Wand2 className="w-4 h-4 text-primary" /> Quick Prompts
            </h3>
            <div className="space-y-2">
              {suggestions.map((s) => (
                <button key={s} onClick={() => setPrompt(s)} className="w-full text-left px-3 py-2.5 rounded-lg border border-border hover:bg-accent text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Output */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card rounded-xl shadow-card p-5">
          <h3 className="text-sm font-medium text-card-foreground mb-3">Output</h3>
          {loading ? (
            <div className="space-y-3">
              <div className="h-2 w-full gradient-primary rounded-full shimmer" />
              <div className="space-y-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-4 bg-muted rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                ))}
              </div>
            </div>
          ) : output ? (
            <div className="editor-prose text-card-foreground whitespace-pre-wrap text-sm leading-relaxed">
              {output}
            </div>
          ) : (
            <div className="py-16 text-center text-sm text-muted-foreground">
              Your generated content will appear here.
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
