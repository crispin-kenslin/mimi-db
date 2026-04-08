import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Download, File, AlertCircle, Loader } from 'lucide-react';

function FileListModal({ isOpen, onClose, cropName, dataType, title }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && cropName && dataType) {
      fetchFiles();
    }
  }, [isOpen, cropName, dataType]);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/files/list/${cropName}/${dataType}`);
      setFiles(response.data);
    } catch (err) {
      setError('Failed to load files');
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          {loading && (
            <div className="modal-loading">
              <Loader className="spinner" size={32} />
              <p>Loading files...</p>
            </div>
          )}

          {error && (
            <div className="modal-error">
              <AlertCircle size={24} />
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && files.length === 0 && (
            <div className="modal-empty">
              <File size={48} strokeWidth={1.5} />
              <p className="modal-empty-title">No Files Available</p>
              <p className="modal-empty-text">
                There are currently no downloadable files in this category.
                Check back later or contact the administrator.
              </p>
            </div>
          )}

          {!loading && !error && files.length > 0 && (
            <div className="file-list">
              <div className="file-list-header">
                <span>Found {files.length} file{files.length !== 1 ? 's' : ''}</span>
              </div>
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-info">
                    <File size={18} strokeWidth={2} />
                    <div className="file-details">
                      <div className="file-name">{file.name}</div>
                      <div className="file-meta">{file.size_str}</div>
                    </div>
                  </div>
                  <a
                    href={file.path}
                    download
                    className="btn-outline btn-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download size={14} /> Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FileListModal;
