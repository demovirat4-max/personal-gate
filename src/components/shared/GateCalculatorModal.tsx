'use client';

import React, { useState } from 'react';
import { Calculator, X, Delete } from 'lucide-react';

interface GateCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GateCalculatorModal({ isOpen, onClose }: GateCalculatorModalProps) {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState<number | null>(null);
  const [degMode, setDegMode] = useState(true); // Degree mode by default (GATE standard)

  if (!isOpen) return null;

  const handleNum = (n: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(n);
    } else {
      setDisplay(display + n);
    }
  };

  const handleClear = () => setDisplay('0');

  const handleBackspace = () => {
    if (display.length <= 1 || display === 'Error') {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const evalExpression = (expr: string) => {
    try {
      // Safe evaluation for basic math expressions
      const sanitized = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/mod/g, '%');
      // eslint-disable-next-line no-eval
      const result = eval(sanitized);
      if (typeof result === 'number' && !isNaN(result)) {
        return Number(result.toFixed(6)).toString();
      }
      return 'Error';
    } catch {
      return 'Error';
    }
  };

  const handleEqual = () => {
    setDisplay(evalExpression(display));
  };

  const handleOp = (op: string) => {
    if (display === 'Error') return;
    setDisplay(display + ' ' + op + ' ');
  };

  const handleUnary = (fn: (x: number) => number) => {
    try {
      const val = parseFloat(display);
      if (isNaN(val)) return;
      const res = fn(val);
      setDisplay(Number(res.toFixed(6)).toString());
    } catch {
      setDisplay('Error');
    }
  };

  const toRad = (deg: number) => (degMode ? (deg * Math.PI) / 180 : deg);

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden font-mono text-slate-100 flex flex-col">
      {/* Header */}
      <div className="bg-slate-950 px-4 py-2.5 flex items-center justify-between border-b border-slate-800 cursor-move">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Calculator className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-200">GATE Virtual Calculator</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setDegMode(!degMode)}
            className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700"
          >
            {degMode ? 'DEG' : 'RAD'}
          </button>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Screen */}
      <div className="p-3 bg-slate-950/90 border-b border-slate-800 text-right">
        <div className="text-[10px] text-slate-500 h-4">{memory !== null ? `M = ${memory}` : ''}</div>
        <div className="text-xl font-bold text-cyan-300 truncate tracking-wider">{display}</div>
      </div>

      {/* Keyboard Grid */}
      <div className="p-3 grid grid-cols-5 gap-1.5 bg-slate-900 text-xs font-semibold">
        {/* Memory Keys */}
        <button onClick={() => setMemory(parseFloat(display) || 0)} className="bg-slate-800 hover:bg-slate-700 text-amber-400 p-2 rounded">MS</button>
        <button onClick={() => memory !== null && setDisplay(memory.toString())} className="bg-slate-800 hover:bg-slate-700 text-amber-400 p-2 rounded">MR</button>
        <button onClick={() => setMemory(null)} className="bg-slate-800 hover:bg-slate-700 text-amber-400 p-2 rounded">MC</button>
        <button onClick={handleClear} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded col-span-2">C</button>

        {/* Scientific Row 1 */}
        <button onClick={() => handleUnary((x) => Math.sin(toRad(x)))} className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 p-2 rounded">sin</button>
        <button onClick={() => handleUnary((x) => Math.cos(toRad(x)))} className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 p-2 rounded">cos</button>
        <button onClick={() => handleUnary((x) => Math.tan(toRad(x)))} className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 p-2 rounded">tan</button>
        <button onClick={() => handleUnary((x) => Math.log10(x))} className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 p-2 rounded">log10</button>
        <button onClick={() => handleUnary((x) => Math.log2(x))} className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 p-2 rounded">log2</button>

        {/* Scientific Row 2 */}
        <button onClick={() => handleUnary((x) => Math.sqrt(x))} className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 p-2 rounded">√x</button>
        <button onClick={() => handleUnary((x) => Math.pow(x, 2))} className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 p-2 rounded">x²</button>
        <button onClick={() => handleOp('**')} className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 p-2 rounded">xʸ</button>
        <button onClick={() => handleUnary((x) => Math.exp(x))} className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 p-2 rounded">eˣ</button>
        <button onClick={() => handleUnary((x) => (x === 0 ? 1 : Array.from({ length: Math.min(x, 20) }, (_, i) => i + 1).reduce((a, b) => a * b, 1)))} className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 p-2 rounded">n!</button>

        {/* Numeric & Basic Ops */}
        <button onClick={() => handleNum('7')} className="bg-slate-950 hover:bg-slate-800 text-white p-2 rounded font-bold">7</button>
        <button onClick={() => handleNum('8')} className="bg-slate-950 hover:bg-slate-800 text-white p-2 rounded font-bold">8</button>
        <button onClick={() => handleNum('9')} className="bg-slate-950 hover:bg-slate-800 text-white p-2 rounded font-bold">9</button>
        <button onClick={() => handleOp('/')} className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 p-2 rounded font-bold">÷</button>
        <button onClick={handleBackspace} className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded flex items-center justify-center"><Delete className="w-3.5 h-3.5" /></button>

        <button onClick={() => handleNum('4')} className="bg-slate-950 hover:bg-slate-800 text-white p-2 rounded font-bold">4</button>
        <button onClick={() => handleNum('5')} className="bg-slate-950 hover:bg-slate-800 text-white p-2 rounded font-bold">5</button>
        <button onClick={() => handleNum('6')} className="bg-slate-950 hover:bg-slate-800 text-white p-2 rounded font-bold">6</button>
        <button onClick={() => handleOp('*')} className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 p-2 rounded font-bold">×</button>
        <button onClick={() => handleOp('%')} className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded">mod</button>

        <button onClick={() => handleNum('1')} className="bg-slate-950 hover:bg-slate-800 text-white p-2 rounded font-bold">1</button>
        <button onClick={() => handleNum('2')} className="bg-slate-950 hover:bg-slate-800 text-white p-2 rounded font-bold">2</button>
        <button onClick={() => handleNum('3')} className="bg-slate-950 hover:bg-slate-800 text-white p-2 rounded font-bold">3</button>
        <button onClick={() => handleOp('-')} className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 p-2 rounded font-bold">-</button>
        <button onClick={() => handleUnary((x) => Math.PI)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded">π</button>

        <button onClick={() => handleNum('0')} className="bg-slate-950 hover:bg-slate-800 text-white p-2 rounded font-bold">0</button>
        <button onClick={() => handleNum('.')} className="bg-slate-950 hover:bg-slate-800 text-white p-2 rounded font-bold">.</button>
        <button onClick={() => handleUnary((x) => -x)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded">±</button>
        <button onClick={() => handleOp('+')} className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 p-2 rounded font-bold">+</button>
        <button onClick={handleEqual} className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white p-2 rounded font-bold shadow-md">=</button>
      </div>
    </div>
  );
}
