import { Play, RotateCcw, Settings, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const App = () => {
  const [entries, setEntries] = useState([
    'Alice',
    'Bob',
    'Charlie',
    'Diana',
    'Eve',
    'Frank',
    'Grace',
    'Henry'
  ]);
  const [entriesText, setEntriesText] = useState(
    'Alice\nBob\nCharlie\nDiana\nEve\nFrank\nGrace\nHenry'
  );
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [removeWinner, setRemoveWinner] = useState(false);
  const [spinDuration, setSpinDuration] = useState(3);

  // const wheelRef = useRef(null);
  const canvasRef = useRef(null);

  // Colors for wheel segments
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEAA7',
    '#DDA0DD',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E9',
    '#F8C471',
    '#82E0AA',
    '#F1948A',
    '#85C1E9',
    '#F4D03F',
    '#AED6F1',
    '#A9DFBF',
    '#F5B7B1'
  ];

  // Draw the wheel
  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas || entries.length === 0) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const anglePerEntry = (2 * Math.PI) / entries.length;

    entries.forEach((entry, index) => {
      const startAngle = index * anglePerEntry;
      const endAngle = (index + 1) * anglePerEntry;

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + anglePerEntry / 2);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 2;
      ctx.fillText(entry, radius * 0.3, 0);
      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  useEffect(() => {
    drawWheel();
  }, [entries, wheelRotation]);

  // Update entries when text changes
  useEffect(() => {
    const newEntries = entriesText
      .split('\n')
      .map(entry => entry.trim())
      .filter(entry => entry.length > 0);
    setEntries(newEntries);
  }, [entriesText]);

  const copyToClipboard = async text => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const removeWinnerFromList = () => {
    const newEntries = entries.filter(entry => entry !== result);
    setEntriesText(newEntries.join('\n'));
    setShowResult(false);
  };

  const removeEntry = index => {
    const newEntries = entries.filter((_, i) => i !== index);
    setEntriesText(newEntries.join('\n'));
  };

  const clearAll = () => {
    setEntries([]);
    setEntriesText('');
    setResult('');
    setShowResult(false);
    setWheelRotation(0);
  };

  const resetWheel = () => {
    setWheelRotation(0);
    setResult('');
    setShowResult(false);
  };

  const spinWheel = () => {
    if (entries.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setShowResult(false);
    setResult('');

    // Random spins between 5-10 full rotations plus random angle
    const minSpins = 5;
    const maxSpins = 10;
    const spins = Math.random() * (maxSpins - minSpins) + minSpins;
    const finalAngle = Math.random() * 2 * Math.PI;
    const totalRotation = spins * 2 * Math.PI + finalAngle;

    // Animate the wheel
    const startTime = Date.now();
    const duration = spinDuration * 1000;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentRotation = totalRotation * easeOut;

      setWheelRotation(currentRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Determine winner
        const normalizedAngle =
          (2 * Math.PI - (currentRotation % (2 * Math.PI))) % (2 * Math.PI);
        const anglePerEntry = (2 * Math.PI) / entries.length;
        const winnerIndex = Math.floor(normalizedAngle / anglePerEntry);
        const winner = entries[winnerIndex];

        setResult(winner);
        setShowResult(true);
        setIsSpinning(false);

        // Remove winner if option is enabled
        if (removeWinner) {
          setTimeout(() => {
            const newEntries = entries.filter(entry => entry !== winner);
            setEntriesText(newEntries.join('\n'));
          }, 2000);
        }
      }
    };

    animate();
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-blue-800 p-4'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-white mb-2'>Wheel of Names</h1>
          <p className='text-blue-100'>
            Enter names and spin the wheel to make a random choice!
          </p>
        </div>

        <div className='grid lg:grid-cols-2 gap-8'>
          {/* Wheel Section */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-2xl shadow-2xl p-8'>
              <div className='relative flex justify-center mb-8'>
                <div className='relative'>
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={400}
                    className='drop-shadow-lg'
                    style={{
                      transform: `rotate(${wheelRotation}rad)`,
                      transition: isSpinning
                        ? 'none'
                        : 'transform 0.5s ease-out'
                    }}
                  />
                  {/* Static pointer overlay */}
                  <div className='absolute inset-0 pointer-events-none'>
                    <div
                      className='absolute w-0 h-0 border-l-[15px] border-r-0 border-t-[10px] border-b-[10px] border-l-gray-800 border-t-transparent border-b-transparent'
                      style={{
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className='flex justify-center gap-4 mb-6'>
                <button
                  onClick={spinWheel}
                  disabled={entries.length === 0 || isSpinning}
                  className='flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105'
                >
                  <Play size={20} />
                  {isSpinning ? 'Spinning...' : 'Spin'}
                </button>
                <button
                  onClick={resetWheel}
                  className='flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105'
                >
                  <RotateCcw size={20} />
                  Reset
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className='flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105'
                >
                  <Settings size={20} />
                  Settings
                </button>
              </div>

              {/* Settings Panel */}
              {showSettings && (
                <div className='bg-gray-50 rounded-lg p-6 mb-6'>
                  <h3 className='text-lg font-semibold mb-4'>Settings</h3>
                  <div className='space-y-4'>
                    <div className='flex items-center gap-3'>
                      <input
                        type='checkbox'
                        id='removeWinner'
                        checked={removeWinner}
                        onChange={e => setRemoveWinner(e.target.checked)}
                        className='w-4 h-4 text-blue-600'
                      />
                      <label
                        htmlFor='removeWinner'
                        className='text-sm font-medium text-gray-700'
                      >
                        Remove winner after spinning
                      </label>
                    </div>
                    <div className='flex items-center gap-3'>
                      <label
                        htmlFor='spinDuration'
                        className='text-sm font-medium text-gray-700'
                      >
                        Spin duration:
                      </label>
                      <input
                        type='range'
                        id='spinDuration'
                        min='1'
                        max='5'
                        step='0.5'
                        value={spinDuration}
                        onChange={e =>
                          setSpinDuration(parseFloat(e.target.value))
                        }
                        className='flex-1'
                      />
                      <span className='text-sm text-gray-600'>
                        {spinDuration}s
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Result */}
              {showResult && (
                <div className='text-center'>
                  <div className='inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-2xl shadow-lg transform animate-pulse'>
                    <h2 className='text-2xl font-bold mb-2'>🎉 Winner! 🎉</h2>
                    <p className='text-3xl font-bold'>{result}</p>
                    <div className='flex gap-2 justify-center mt-4'>
                      <button
                        onClick={() => copyToClipboard(result)}
                        className='bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors'
                      >
                        Copy to Clipboard
                      </button>
                    </div>
                  </div>
                  {!removeWinner && (
                    <div className='mt-4 text-center'>
                      <p className='text-gray-600 text-sm mb-2'>
                        Remove winner from list?
                      </p>
                      <button
                        onClick={removeWinnerFromList}
                        className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors'
                      >
                        Remove Winner
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Entries Section */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-2xl shadow-2xl p-6'>
              <h2 className='text-2xl font-bold mb-6 text-center text-gray-800'>
                Entries
              </h2>

              {/* Add Entry */}
              <div className='mb-6'>
                <label
                  htmlFor='entriesText'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Enter names (one per line):
                </label>
                <textarea
                  id='entriesText'
                  value={entriesText}
                  onChange={e => setEntriesText(e.target.value)}
                  placeholder='Enter names, one per line...'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
                  rows={8}
                />
              </div>

              {/* Entries List */}
              <div className='space-y-2 mb-6 max-h-96 overflow-y-auto'>
                {entries.map((entry, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg'
                  >
                    <span className='font-medium text-gray-700'>{entry}</span>
                    <button
                      onClick={() => removeEntry(index)}
                      className='text-red-500 hover:text-red-700 transition-colors'
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Entry Count */}
              <div className='text-center text-gray-600 mb-4'>
                <p className='font-medium'>
                  {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                </p>
              </div>

              {/* Clear All */}
              <div className='text-center'>
                <button
                  onClick={clearAll}
                  className='bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors'
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
