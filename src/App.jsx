// import React, { useState, useEffect, useRef } from 'react';
// import { Printer, Download, RefreshCw, Layers, Settings, FileText, Layout, AlertCircle } from 'lucide-react';

// // --- BARCODE COMPONENT (Uses JsBarcode) ---
// const BarcodeSVG = React.memo(({ text, format = "CODE128" }) => {
//   const svgRef = useRef(null);

//   useEffect(() => {
//     // Check if library is loaded before attempting to render
//     if (window.JsBarcode && svgRef.current) {
//       try {
//         window.JsBarcode(svgRef.current, text, {
//           format: format,
//           width: 2,
//           height: 45, // Reduced height to fit more rows per page
//           displayValue: true,
//           font: "monospace",
//           fontSize: 14,
//           textAlign: "center",
//           textMargin: 5,
//           margin: 10,
//           background: "#ffffff",
//           lineColor: "#000000"
//         });
//       } catch (e) {
//         console.error("Barcode generation failed", e);
//       }
//     }
//   }, [text, format]);

//   return (
//     <div className="w-full h-full flex items-center justify-center bg-white">
//       <svg 
//         ref={svgRef} 
//         className="max-w-full max-h-full"
//         style={{ width: '100%', height: 'auto' }}
//       ></svg>
//     </div>
//   );
// });

// export default function App() {
//   const [scriptLoaded, setScriptLoaded] = useState(false);
//   const [config, setConfig] = useState({
//     prefix: 'PCB-PM-',
//     startNum: 1,
//     count: 50, // Default 50 for quick preview
//     padding: 6
//   });

//   const [printMode, setPrintMode] = useState('single');
//   const [items, setItems] = useState([]);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [timeTaken, setTimeTaken] = useState(0);

//   // Load JsBarcode library dynamically (Works in Preview & Local)
//   // For strictly offline local use, you can npm install jsbarcode 
//   // and import it, but this method works universally without build steps.
//   useEffect(() => {
//     if (window.JsBarcode) {
//       setScriptLoaded(true);
//       return;
//     }

//     const script = document.createElement('script');
//     script.src = "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js";
//     script.async = true;
//     script.onload = () => setScriptLoaded(true);
//     document.body.appendChild(script);
//   }, []);

//   const padNumber = (num, size) => {
//     let s = num + "";
//     while (s.length < size) s = "0" + s;
//     return s;
//   };

//   const handleGenerate = async () => {
//     if (!scriptLoaded) {
//       alert("Barcode library is loading... please wait a moment.");
//       return;
//     }

//     setIsGenerating(true);
//     // Use setTimeout to allow UI to render loading state
//     setTimeout(() => {
//       const start = performance.now();
//       const newItems = [];
//       const { prefix, startNum, count, padding } = config;

//       for (let i = 0; i < count; i++) {
//         const currentNum = parseInt(startNum) + i;
//         const serial = `${prefix}${padNumber(currentNum, padding)}`;
//         newItems.push({
//           id: i,
//           serial: serial
//         });
//       }

//       setItems(newItems);
//       const end = performance.now();
//       setTimeTaken((end - start).toFixed(2));
//       setIsGenerating(false);
//     }, 100);
//   };

//   const exportBase64JSON = async () => {
//     if (!items.length) return;
//     if (!window.JsBarcode) {
//       alert("Library not ready.");
//       return;
//     }

//     const confirmExport = window.confirm(`Generate and export ${items.length} Base64 barcodes? This might take a moment.`);
//     if (!confirmExport) return;

//     // Generate Base64 strings locally on the fly for export
//     const exportData = items.map(item => {
//       // 1. Create a temporary SVG element in memory
//       const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      
//       // 2. Generate barcode using JsBarcode (Local generation)
//       window.JsBarcode(svg, item.serial, {
//         format: "CODE128",
//         width: 2,
//         height: 60,
//         displayValue: true,
//         font: "monospace",
//         fontSize: 14,
//         textAlign: "center",
//         textMargin: 5,
//         margin: 10,
//         background: "#ffffff",
//         lineColor: "#000000"
//       });

//       // 3. Serialize to XML String
//       const serializer = new XMLSerializer();
//       const svgString = serializer.serializeToString(svg);
      
//       // 4. Add XML Headers to match strict format (same as Python script)
//       const fullSvgStr = `<?xml version="1.0" encoding="UTF-8"?>` + svgString;
      
//       // 5. Convert to Base64
//       const base64 = btoa(fullSvgStr);
      
//       return {
//         id: item.id,
//         serial: item.serial,
//         // The requested Data URI format
//         barcode_base64: `data:image/svg+xml;base64,${base64}`
//       };
//     });

//     const jsonString = JSON.stringify(exportData, null, 2);
//     const blob = new Blob([jsonString], { type: "application/json" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = `barcodes-${config.startNum}-${config.startNum + config.count}.json`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const handlePrint = () => {
//     window.print();
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      
//       {/* Controls - Hidden during print */}
//       <div className="print:hidden bg-white border-b shadow-sm sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-4 py-4">
//           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
//             <div>
//               <h1 className="text-2xl font-bold flex items-center gap-2 text-indigo-600">
//                 <Layers className="h-6 w-6" />
//                 Bulk Barcode Engine
//               </h1>
//               <p className="text-sm text-gray-500 mt-1">
//                 Generates scalable Code 128 barcodes (Local).
//               </p>
//             </div>
//             <div className="flex gap-2">
//               <button 
//                 onClick={exportBase64JSON}
//                 disabled={items.length === 0 || !scriptLoaded}
//                 className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
//               >
//                 <Download className="h-4 w-4" />
//                 Export Base64 JSON
//               </button>
//               <button 
//                 onClick={handlePrint}
//                 disabled={items.length === 0}
//                 className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <Printer className="h-4 w-4" />
//                 Print Labels
//               </button>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-6 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
//             <div className="md:col-span-2">
//               <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Prefix</label>
//               <input 
//                 type="text" 
//                 value={config.prefix}
//                 onChange={(e) => setConfig({...config, prefix: e.target.value})}
//                 className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Start #</label>
//               <input 
//                 type="number" 
//                 value={config.startNum}
//                 onChange={(e) => setConfig({...config, startNum: parseInt(e.target.value) || 0})}
//                 className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Quantity</label>
//               <input 
//                 type="number" 
//                 value={config.count}
//                 onChange={(e) => setConfig({...config, count: parseInt(e.target.value) || 0})}
//                 className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
//               />
//             </div>
//             <div>
//                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Print Layout</label>
//                <div className="relative">
//                  <select 
//                     value={printMode}
//                     onChange={(e) => setPrintMode(e.target.value)}
//                     className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white cursor-pointer"
//                  >
//                    <option value="single">Single (Label Printer)</option>
//                    <option value="grid">Grid (A4 Sheet)</option>
//                  </select>
//                  <Layout className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none"/>
//                </div>
//             </div>
//             <div>
//               <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 text-transparent">.</label>
//               <button 
//                 onClick={handleGenerate}
//                 disabled={isGenerating || !scriptLoaded}
//                 className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-md transition-colors disabled:opacity-50"
//               >
//                 {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
//                 {isGenerating ? '...' : 'Generate'}
//               </button>
//             </div>
//           </div>
          
//           {!scriptLoaded && (
//             <div className="mt-4 p-3 bg-amber-50 text-amber-800 rounded-lg flex items-center gap-2 text-sm border border-amber-200">
//               <AlertCircle className="h-4 w-4" />
//               Loading Barcode Library... (Requires Internet connection)
//             </div>
//           )}

//           {items.length > 0 && (
//              <div className="mt-2 flex justify-between items-center">
//                 <div className="text-xs text-green-600 font-medium flex items-center gap-1">
//                   <FileText className="h-3 w-3" />
//                   Generated {items.length} barcodes
//                 </div>
//                 <div className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded">
//                    Mode: {printMode === 'single' ? 'Single Label' : 'Sheet Grid'}
//                 </div>
//              </div>
//           )}
//         </div>
//       </div>

//       {/* Main Grid Area */}
//       <div className={`
//         max-w-7xl mx-auto px-4 py-8 
//         print:p-0 print:m-0 print:w-full print:max-w-none
//       `}>
        
//         {items.length === 0 ? (
//           <div className="text-center py-20 text-gray-400">
//             <div className="mb-4 bg-gray-100 h-32 w-64 mx-auto rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
//               Preview Area
//             </div>
//             <p>Configure settings above and click Generate to start.</p>
//           </div>
//         ) : (
//           <div className={`
//             ${printMode === 'grid' 
//                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 print:grid-cols-4 gap-4 print:gap-2' 
//                : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 print:block'
//              }
//           `}>
//             {items.map((item) => (
//               <div 
//                 key={item.id} 
//                 className={`
//                   border border-gray-200 bg-white rounded flex flex-col items-center justify-center overflow-hidden
//                   ${printMode === 'single' 
//                     ? 'print:border-0 print:p-0 print:m-0 print:break-after-page label-size-force' 
//                     : 'print:border-0 print:break-inside-avoid print:p-2 print:shadow-none'
//                   }
//                 `}
//                 style={printMode === 'grid' ? { minHeight: '1.2in' } : {}}
//               >
//                  <BarcodeSVG text={item.serial} />
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Global Print Styles */}
//       <style>{`
//         @media print {
//           @page {
//             size: auto; 
//             margin: 0;
//           }
//           html, body {
//             margin: 0;
//             padding: 0;
//             background: white;
//             -webkit-print-color-adjust: exact;
//           }
          
//           .label-size-force {
//             width: 100% !important;
//             height: 100vh !important;
//             max-width: none !important;
//             max-height: none !important;
//             display: flex !important;
//             align-items: center !important;
//             justify-content: center !important;
//             overflow: hidden !important;
//             page-break-after: always;
//             break-after: page;
//           }
//         }
//       `}</style>

//     </div>
//   );
// }

import React, { useState, useEffect, useRef } from 'react';
import { Printer, Download, RefreshCw, Layers, Settings, FileText, Layout, AlertCircle, Grid3X3 } from 'lucide-react';

// --- BARCODE COMPONENT (Uses JsBarcode) ---
const BarcodeSVG = React.memo(({ text, format = "CODE128" }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    // Check if library is loaded before attempting to render
    if (window.JsBarcode && svgRef.current) {
      try {
        window.JsBarcode(svgRef.current, text, {
          format: format,
          width: 2,
          height: 40, // Slightly reduced to safely fit high-density grids (like 10 rows)
          displayValue: true,
          font: "monospace",
          fontSize: 14,
          textAlign: "center",
          textMargin: 2,
          margin: 5,
          background: "#ffffff",
          lineColor: "#000000"
        });
      } catch (e) {
        console.error("Barcode generation failed", e);
      }
    }
  }, [text, format]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-white overflow-hidden">
      <svg 
        ref={svgRef} 
        className="max-w-full max-h-full"
        style={{ width: '100%', height: 'auto' }}
      ></svg>
    </div>
  );
});

export default function App() {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  
  // General Configuration
  const [config, setConfig] = useState({
    prefix: 'PCB-Pulse-450-',
    startNum: 1,
    count: 40, 
    padding: 6
  });

  // Print Configuration
  const [printMode, setPrintMode] = useState('single');
  const [gridSettings, setGridSettings] = useState({
    cols: 4,
    rows: 10
  });

  const [items, setItems] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);

  // Load JsBarcode library dynamically
  useEffect(() => {
    if (window.JsBarcode) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, []);

  const padNumber = (num, size) => {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
  };

  const handleGenerate = async () => {
    if (!scriptLoaded) {
      alert("Barcode library is loading... please wait a moment.");
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      const start = performance.now();
      const newItems = [];
      const { prefix, startNum, count, padding } = config;

      for (let i = 0; i < count; i++) {
        const currentNum = parseInt(startNum) + i;
        const serial = `${prefix}${padNumber(currentNum, padding)}`;
        newItems.push({
          id: i,
          serial: serial
        });
      }

      setItems(newItems);
      const end = performance.now();
      setTimeTaken((end - start).toFixed(2));
      setIsGenerating(false);
    }, 100);
  };

  const exportBase64JSON = async () => {
    if (!items.length) return;
    if (!window.JsBarcode) {
      alert("Library not ready.");
      return;
    }

    const confirmExport = window.confirm(`Generate and export ${items.length} Base64 barcodes? This might take a moment.`);
    if (!confirmExport) return;

    const exportData = items.map(item => {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      window.JsBarcode(svg, item.serial, {
        format: "CODE128",
        width: 2,
        height: 40,
        displayValue: true,
        font: "monospace",
        fontSize: 14,
        textAlign: "center",
        textMargin: 2,
        margin: 5,
        background: "#ffffff",
        lineColor: "#000000"
      });

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const fullSvgStr = `<?xml version="1.0" encoding="UTF-8"?>` + svgString;
      const base64 = btoa(fullSvgStr);
      
      return {
        id: item.id,
        serial: item.serial,
        barcode_base64: `data:image/svg+xml;base64,${base64}`
      };
    });

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `barcodes-${config.startNum}-${config.startNum + config.count}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      
      {/* Controls - Hidden during print */}
      <div className="print:hidden bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2 text-indigo-600">
                <Layers className="h-6 w-6" />
                Bulk Barcode Engine
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Generates scalable Code 128 barcodes (Local).
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={exportBase64JSON}
                disabled={items.length === 0 || !scriptLoaded}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Export Base64 JSON
              </button>
              <button 
                onClick={handlePrint}
                disabled={items.length === 0}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="h-4 w-4" />
                Print Labels
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
            {/* Input Config Group */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Prefix</label>
              <input 
                type="text" 
                value={config.prefix}
                onChange={(e) => setConfig({...config, prefix: e.target.value})}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Start #</label>
              <input 
                type="number" 
                value={config.startNum}
                onChange={(e) => setConfig({...config, startNum: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Quantity</label>
              <input 
                type="number" 
                value={config.count}
                onChange={(e) => setConfig({...config, count: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
              />
            </div>

            {/* Layout Group */}
            <div className="md:col-span-3 border-l pl-4 border-gray-200">
               <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Print Layout</label>
               <div className="relative">
                 <select 
                    value={printMode}
                    onChange={(e) => setPrintMode(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white cursor-pointer text-sm"
                 >
                   <option value="single">Single (Label Printer)</option>
                   <option value="grid">Grid (Sheet)</option>
                 </select>
                 <Layout className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none"/>
               </div>
            </div>

            {/* Generate Button */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 text-transparent">.</label>
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !scriptLoaded}
                className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-md transition-colors disabled:opacity-50 text-sm font-medium"
              >
                {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
                {isGenerating ? '...' : 'Generate'}
              </button>
            </div>
            
            {/* Conditional Grid Options - Only show if Grid is selected */}
            {printMode === 'grid' && (
              <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-6 gap-4 mt-2 pt-2 border-t border-gray-200 animate-in fade-in slide-in-from-top-1">
                 <div className="md:col-span-1 flex items-center justify-center bg-indigo-50 rounded text-indigo-700 text-xs font-bold uppercase tracking-wider">
                    <Grid3X3 className="w-4 h-4 mr-2" />
                    Grid Options
                 </div>
                 <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Columns</label>
                    <input 
                      type="number" 
                      min="1" max="10"
                      value={gridSettings.cols}
                      onChange={(e) => setGridSettings({...gridSettings, cols: Math.max(1, parseInt(e.target.value) || 1)})}
                      className="w-full px-3 py-1 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                 </div>
                 <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Rows / Page</label>
                    <input 
                      type="number" 
                      min="1" max="20"
                      value={gridSettings.rows}
                      onChange={(e) => setGridSettings({...gridSettings, rows: Math.max(1, parseInt(e.target.value) || 1)})}
                      className="w-full px-3 py-1 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                 </div>
                 <div className="md:col-span-3 flex items-center text-xs text-gray-500 italic">
                    Configures barcode size to fit exactly {gridSettings.rows} rows per page.
                 </div>
              </div>
            )}
          </div>
          
          {!scriptLoaded && (
            <div className="mt-4 p-3 bg-amber-50 text-amber-800 rounded-lg flex items-center gap-2 text-sm border border-amber-200">
              <AlertCircle className="h-4 w-4" />
              Loading Barcode Library... (Requires Internet connection)
            </div>
          )}

          {items.length > 0 && (
             <div className="mt-2 flex justify-between items-center">
                <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Generated {items.length} barcodes
                </div>
                <div className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded">
                   Mode: {printMode === 'single' ? 'Single Label' : `Grid (${gridSettings.cols} x ${gridSettings.rows})`}
                </div>
             </div>
          )}
        </div>
      </div>

      {/* Main Grid Area */}
      <div className={`
        max-w-7xl mx-auto px-4 py-8 
        print:p-0 print:m-0 print:w-full print:max-w-none
      `}>
        
        {items.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="mb-4 bg-gray-100 h-32 w-64 mx-auto rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
              Preview Area
            </div>
            <p>Configure settings above and click Generate to start.</p>
          </div>
        ) : (
          <div 
            className={`${printMode === 'grid' ? 'grid gap-4 print:gap-1' : 'block'}`}
            style={printMode === 'grid' ? {
              // Dynamic Grid Columns based on settings
              gridTemplateColumns: `repeat(${gridSettings.cols}, minmax(0, 1fr))`
            } : {}}
          >
            {items.map((item) => (
              <div 
                key={item.id} 
                className={`
                  border border-gray-200 bg-white rounded flex flex-col items-center justify-center overflow-hidden
                  ${printMode === 'single' 
                    ? 'print:border-0 print:p-0 print:m-0 print:break-after-page label-size-force' 
                    : 'print:border-0 print:break-inside-avoid print:p-1 print:shadow-none'
                  }
                `}
                style={printMode === 'grid' ? { 
                  // Calculate dynamic height: 10.5 inches is approx safe printable height on A4/Letter
                  // We use a slightly smaller value for safety margin.
                  minHeight: `calc(10.5in / ${gridSettings.rows})`,
                  height: `calc(10.5in / ${gridSettings.rows})`
                } : {}}
              >
                 <BarcodeSVG text={item.serial} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Global Print Styles */}
      <style>{`
        @media print {
          @page {
            size: auto; 
            margin: 0.2in; /* Small margin for sheet printing */
          }
          html, body {
            margin: 0;
            padding: 0;
            background: white;
            -webkit-print-color-adjust: exact;
          }
          
          .label-size-force {
            width: 100% !important;
            height: 100vh !important;
            max-width: none !important;
            max-height: none !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            overflow: hidden !important;
            page-break-after: always;
            break-after: page;
          }
        }
      `}</style>

    </div>
  );
}