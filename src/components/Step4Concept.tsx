import React, { useState, useRef } from 'react';
import { FRAMEWORKS } from '../constants';
import { Framework } from '../types';
import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import JSZip from 'jszip';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

interface Props {
  selectedFramework: Framework | null;
  onSelectFramework: (framework: Framework) => void;
  concept: string;
  onConceptChange: (concept: string) => void;
}

export default function Step4Concept({ selectedFramework, onSelectFramework, concept, onConceptChange }: Props) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setProgress(0);
    let extractedText = '';

    try {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        extractedText = await extractPdf(file);
      } else if (file.type === 'application/epub+zip' || file.name.endsWith('.epub')) {
        extractedText = await extractEpub(file);
      } else {
        alert('Unsupported file type. Please upload a PDF or EPUB.');
      }

      if (extractedText) {
        onConceptChange(extractedText);
      }
    } catch (error) {
      console.error('Extraction error:', error);
      alert('Failed to extract text from file.');
    } finally {
      setIsExtracting(false);
      setProgress(100);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const extractPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const maxPages = Math.min(pdf.numPages, 15);
    let text = '';

    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(' ');
      text += pageText + '\\n\\n';
      setProgress(Math.round((i / maxPages) * 100));
    }
    return text.slice(0, 3000); // Limit to reasonable concept size
  };

  const extractEpub = async (file: File): Promise<string> => {
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(file);
    
    // Find container.xml
    const containerFile = loadedZip.file('META-INF/container.xml');
    if (!containerFile) throw new Error('Invalid EPUB: Missing container.xml');
    
    const containerXml = await containerFile.async('text');
    const parser = new DOMParser();
    const containerDoc = parser.parseFromString(containerXml, 'text/xml');
    const rootfile = containerDoc.querySelector('rootfile');
    if (!rootfile) throw new Error('Invalid EPUB: Missing rootfile');
    
    const opfPath = rootfile.getAttribute('full-path');
    if (!opfPath) throw new Error('Invalid EPUB: Missing OPF path');
    
    const opfFile = loadedZip.file(opfPath);
    if (!opfFile) throw new Error('Invalid EPUB: Missing OPF file');
    
    const opfXml = await opfFile.async('text');
    const opfDoc = parser.parseFromString(opfXml, 'text/xml');
    
    // Get base path for resolving relative paths
    const basePath = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';
    
    // Parse manifest and spine
    const manifest = opfDoc.querySelector('manifest');
    const spine = opfDoc.querySelector('spine');
    if (!manifest || !spine) throw new Error('Invalid EPUB: Missing manifest or spine');
    
    const itemrefs = Array.from(spine.querySelectorAll('itemref'));
    let text = '';
    
    for (let i = 0; i < Math.min(itemrefs.length, 5); i++) { // Read up to 5 chapters to stay within limits
      const idref = itemrefs[i].getAttribute('idref');
      const item = manifest.querySelector(`item[id="${idref}"]`);
      if (!item) continue;
      
      const href = item.getAttribute('href');
      if (!href) continue;
      
      const chapterPath = basePath + href;
      const chapterFile = loadedZip.file(chapterPath);
      if (!chapterFile) continue;
      
      const chapterHtml = await chapterFile.async('text');
      const chapterDoc = parser.parseFromString(chapterHtml, 'text/html');
      text += chapterDoc.body.textContent || '';
      text += '\\n\\n';
      
      setProgress(Math.round(((i + 1) / Math.min(itemrefs.length, 5)) * 100));
    }
    
    return text.slice(0, 3000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-bold text-white mb-8">Concept & Framework</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {FRAMEWORKS.map((f) => (
            <button
              key={f.id}
              onClick={() => onSelectFramework(f)}
              className={`p-6 text-left border rounded-2xl transition-all duration-300 ${
                selectedFramework?.id === f.id
                  ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_20px_rgba(0,242,254,0.2)] scale-[1.02]'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <h3 className={`text-lg font-display font-bold ${selectedFramework?.id === f.id ? 'text-cyan-400' : 'text-white'}`}>{f.name}</h3>
              <p className={`mt-2 text-xs leading-relaxed ${selectedFramework?.id === f.id ? 'text-cyan-100' : 'text-gray-400'}`}>
                {f.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end mb-4">
          <label className="block text-sm font-medium text-gray-300">Concept / Subject Matter</label>
          <div>
            <input
              type="file"
              accept=".pdf,.epub"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              disabled={isExtracting}
            >
              {isExtracting ? 'Extracting...' : 'Upload PDF/EPUB'}
            </button>
          </div>
        </div>
        
        {isExtracting && (
          <div className="w-full bg-white/10 rounded-full h-2 mb-4 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-400 to-purple-600 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        )}

        <textarea
          value={concept}
          onChange={(e) => onConceptChange(e.target.value)}
          placeholder="Describe the song concept, story, or emotional arc..."
          className="w-full h-48 p-6 border border-white/10 rounded-2xl bg-black/50 text-white focus:border-cyan-400 focus:outline-none resize-y transition-colors placeholder-gray-600"
        />
      </div>
    </div>
  );
}
