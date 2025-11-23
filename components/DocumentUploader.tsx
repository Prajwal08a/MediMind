import React, { useCallback, useRef, useState } from 'react';
import { FileTextIcon } from './icons/FileTextIcon';
import { UploadIcon } from './icons/UploadIcon';
import { ManagedDocument } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { TrashIcon } from './icons/TrashIcon';

interface DocumentManagerProps {
  documents: ManagedDocument[];
  selectedDocumentId: string | null;
  onDocumentsUpload: (documents: ManagedDocument[]) => void;
  onDocumentSelect: (id: string) => void;
  onDocumentDelete: (id: string) => void;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({ 
  documents,
  selectedDocumentId,
  onDocumentsUpload,
  onDocumentSelect,
  onDocumentDelete,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingFile(true);

    const processFile = (file: File): Promise<ManagedDocument | null> => {
        return new Promise((resolve) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const base64 = (e.target?.result as string).split(',')[1];
                    resolve({
                        id: `${file.name}-${Date.now()}`,
                        name: file.name,
                        type: 'image',
                        content: base64,
                        mimeType: file.type,
                    });
                };
                reader.readAsDataURL(file);
            } else if (file.type === 'text/plain') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const text = e.target?.result as string;
                    resolve({
                        id: `${file.name}-${Date.now()}`,
                        name: file.name,
                        type: 'text',
                        content: text,
                    });
                };
                reader.readAsText(file);
            } else {
                alert(`Unsupported file type: ${file.name}. Please upload a .txt file or an image (jpg, png, webp).`);
                resolve(null);
            }
        });
    };

    const allFilesPromises = Array.from(files).map(processFile);
    const processedDocs = await Promise.all(allFilesPromises);
    const validDocs = processedDocs.filter((doc): doc is ManagedDocument => doc !== null);
    
    if(validDocs.length > 0) {
        onDocumentsUpload(validDocs);
    }
    
    setIsProcessingFile(false);
    
    // Reset file input to allow uploading the same file again
    event.target.value = '';
  }, [onDocumentsUpload]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col space-y-4 overflow-hidden h-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".txt,.jpg,.jpeg,.png,.webp"
        multiple
      />
      
      <div>
        <button 
            onClick={handleUploadClick}
            disabled={isProcessingFile}
            className="flex items-center justify-center w-full p-3 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-all duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-60"
            title="Upload document(s) (.txt, .jpg, .png)"
        >
            {isProcessingFile ? (
                <>
                    <SpinnerIcon className="w-5 h-5 mr-3 animate-spin text-blue-500" />
                    <span className="font-semibold text-sm text-blue-600">Processing...</span>
                </>
            ) : (
                <>
                    <UploadIcon className="w-5 h-5 mr-2 text-gray-500" />
                    <span className="font-semibold text-sm text-gray-700">Upload Document(s)</span>
                </>
            )}
        </button>
      </div>


      <div className="flex-1 flex flex-col min-h-0">
        <h3 className="text-xs font-semibold text-gray-400 mb-2 px-2 tracking-wider uppercase">Documents ({documents.length})</h3>
        <div className="flex-1 overflow-y-auto pr-1 space-y-1">
            {documents.length === 0 && (
                <div className="text-center py-8 text-sm text-gray-500">
                    No documents uploaded.
                </div>
            )}
            {documents.map(doc => (
                <div 
                    key={doc.id} 
                    onClick={() => onDocumentSelect(doc.id)}
                    title={`Select document: ${doc.name}`}
                    className={`group p-3 rounded-lg cursor-pointer flex items-center justify-between transition-all duration-200 ease-in-out ${
                        selectedDocumentId === doc.id 
                        ? 'bg-blue-100 text-blue-800 font-semibold' 
                        : 'text-gray-600 hover:bg-blue-50'
                    }`}
                >
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <FileTextIcon className={`w-5 h-5 flex-shrink-0 transition-colors ${selectedDocumentId === doc.id ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className="text-sm font-medium truncate">{doc.name}</span>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDocumentDelete(doc.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-100 transition-all duration-200 group-hover:scale-105"
                        aria-label="Delete document"
                        title="Delete document"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentManager;