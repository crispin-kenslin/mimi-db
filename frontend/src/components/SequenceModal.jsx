import React, { useState, useEffect } from 'react';
import { X, Copy, Download } from 'lucide-react';

function SequenceModal({ isOpen, onClose, selectedGene, cropName }) {
  const [sequenceLoading, setSequenceLoading] = useState(false);
  const [sequenceError, setSequenceError] = useState('');
  const [sequenceResult, setSequenceResult] = useState(null);
  const [copyStatus, setCopyStatus] = useState('');

  useEffect(() => {
    if (isOpen && selectedGene) {
      fetchGeneSequence(selectedGene);
    } else {
      // Reset state when closed
      setSequenceResult(null);
      setSequenceError('');
      setCopyStatus('');
    }
  }, [isOpen, selectedGene, cropName]);

  const fetchGeneSequence = async (row) => {
    setSequenceLoading(true);
    setSequenceError('');
    setSequenceResult(null);

    try {
      try {
        const genomesResp = await fetch('/api/tools/genomes');
        if (genomesResp.ok) {
          const json = await genomesResp.json();
          const matching = (json.genomes || []).find(
            (g) => g.crop === cropName || g.crop === cropName.toLowerCase()
          );
          if (!matching || !matching.has_fasta) {
            setSequenceError('No genome FASTA available for this crop; cannot retrieve sequence.');
            setSequenceLoading(false);
            return;
          }
        }
      } catch (precheckErr) {
        // Ignore precheck errors
      }

      const params = new URLSearchParams({
        crop: cropName,
        seqid: row.chr,
        start: String(row.start),
        end: String(row.end),
        strand: row.strand || '+',
        gene: row.gene || row.geneId,
      });

      const response = await fetch(`/api/tools/gene-sequence?${params.toString()}`);
      if (!response.ok) {
        let errMsg = `HTTP ${response.status}`;
        try {
          const ct = response.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const j = await response.json();
            errMsg = j.detail || JSON.stringify(j);
          } else {
            const t = await response.text();
            if (t) errMsg = t;
          }
        } catch (parseErr) {}
        throw new Error(errMsg);
      }
      const payload = await response.json();
      setSequenceResult(payload);
    } catch (err) {
      console.error('Error fetching gene sequence:', err);
      setSequenceError(String(err.message || err));
    } finally {
      setSequenceLoading(false);
    }
  };

  const normalizeSequence = (sequence) => (sequence ? sequence.replace(/\s+/g, '') : '');

  const buildFastaText = () => {
    if (!sequenceResult || !selectedGene) return '';
    const geneName = selectedGene.gene || selectedGene.geneId;
    const header = `>${geneName} ${sequenceResult.seqid}:${sequenceResult.start}-${sequenceResult.end}(${sequenceResult.strand})`;
    const seq = normalizeSequence(sequenceResult.sequence || '');
    return `${header}\n${seq}`;
  };

  const copyToClipboard = async (text, label) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(`${label} copied`);
      setTimeout(() => setCopyStatus(''), 1500);
    } catch (err) {
      console.error('Copy failed:', err);
      setCopyStatus('Copy failed');
      setTimeout(() => setCopyStatus(''), 1500);
    }
  };

  const downloadFasta = () => {
    const text = buildFastaText();
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const geneName = selectedGene.gene || selectedGene.geneId;
    a.download = `${geneName}_sequence.fasta`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="sequence-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="sequence-modal-header">
          <h2 className="modal-title">Gene Sequence</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="sequence-modal-body">
          <div className="selected-gene-info">
            <strong>Gene:</strong> {selectedGene.gene || selectedGene.geneId} <br />
            <strong>Region:</strong> {selectedGene.chr}:{selectedGene.start}-{selectedGene.end} ({selectedGene.strand})
          </div>

          <div className="sequence-result-container">
            {sequenceLoading && <div className="deg-loading">Retrieving sequence...</div>}
            {sequenceError && <div className="deg-error">{sequenceError}</div>}
            
            {!sequenceLoading && !sequenceError && sequenceResult && (
              <div className="sequence-display">
                <div className="sequence-meta">
                  <div><strong>Length:</strong> {sequenceResult.length} bp</div>
                  <div className="sequence-actions">
                    {copyStatus && <span className="copy-status">{copyStatus}</span>}
                    <button
                      className="btn-outline btn-sm"
                      onClick={() => copyToClipboard(normalizeSequence(sequenceResult.sequence), 'Sequence')}
                    >
                      <Copy size={14} /> Copy Sequence
                    </button>
                    <button
                      className="btn-outline btn-sm"
                      onClick={() => copyToClipboard(buildFastaText(), 'FASTA')}
                    >
                      <Copy size={14} /> Copy FASTA
                    </button>
                    <button
                      className="btn-primary btn-sm"
                      onClick={downloadFasta}
                    >
                      <Download size={14} /> Download FASTA
                    </button>
                  </div>
                </div>
                <textarea
                  className="sequence-textarea"
                  readOnly
                  value={normalizeSequence(sequenceResult.sequence)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SequenceModal;
