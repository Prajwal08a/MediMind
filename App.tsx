import React, { useState, useEffect } from 'react';
import DocumentManager from './components/DocumentUploader';
import ChatInterface from './components/ChatInterface';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ManagedDocument, Persona, SummaryFocus, Model, Voice } from './types';
import { summarizeDocument, generateSuggestedQuestions } from './services/geminiService';
import { getSystemInstruction } from './utils/personaInstructions';
import { getSummaryPrompt } from './utils/summaryPrompts';
import { LogoIcon } from './components/icons/LogoIcon';
import { CpuChipIcon } from './components/icons/CpuChipIcon';
import SummarySection from './components/SummarySection';
import SettingsSection from './components/SettingsSection';
import PersonaSelector from './components/PersonaSelector';
import VoiceSelector from './components/VoiceSelector';
import ModelSelector from './components/ModelSelector';

const App: React.FC = () => {
  const [documents, setDocuments] = useState<ManagedDocument[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [persona, setPersona] = useState<Persona>('professional');
  const [summaryFocus, setSummaryFocus] = useState<SummaryFocus>('key_points');
  const [model, setModel] = useState<Model>('gemini-2.5-flash');
  const [voice, setVoice] = useState<Voice>('Kore');
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState<boolean>(false);

  const selectedDocument = documents.find(doc => doc.id === selectedDocumentId) || null;

  const handleDocumentsUpload = (newDocs: ManagedDocument[]) => {
    const newDocuments = [...documents, ...newDocs];
    setDocuments(newDocuments);
    if (newDocs.length > 0) {
      setSelectedDocumentId(newDocs[newDocs.length - 1].id);
    }
  };

  const handleDocumentSelect = (id: string) => {
    setSelectedDocumentId(id);
  };
  
  const handleDocumentDelete = (id: string) => {
    const newDocuments = documents.filter(doc => doc.id !== id);
    setDocuments(newDocuments);
    if (selectedDocumentId === id) {
      setSelectedDocumentId(newDocuments.length > 0 ? newDocuments[0].id : null);
    }
  };

  useEffect(() => {
    if (!selectedDocument) {
      setSummary('');
      setSuggestedQuestions([]);
      return;
    }

    const generateAndSetSummary = async () => {
      setIsSummarizing(true);
      setIsGeneratingSuggestions(true);
      setSummary('');
      setSuggestedQuestions([]);
      try {
        const systemInstruction = getSystemInstruction(persona);
        const summaryPrompt = getSummaryPrompt(summaryFocus);
        const summaryResult = await summarizeDocument(selectedDocument, systemInstruction, summaryPrompt, model);
        setSummary(summaryResult);

        if (summaryResult && !summaryResult.toLowerCase().includes("could not generate")) {
            const questions = await generateSuggestedQuestions(summaryResult, model);
            setSuggestedQuestions(questions);
        }

      } catch (error)
 {
        console.error("Failed to generate summary or suggestions:", error);
        setSummary("Could not generate a summary for this document.");
      } finally {
        setIsSummarizing(false);
        setIsGeneratingSuggestions(false);
      }
    };

    generateAndSetSummary();
  }, [selectedDocument, persona, summaryFocus, model]);

  return (
    <div className="flex h-screen w-screen font-sans bg-gray-100">
      <div className="flex w-full h-full">
        {/* Left Sidebar */}
        <aside className="w-[320px] flex-shrink-0 h-full flex flex-col bg-white text-gray-800 p-4 border-r border-gray-200">
          <div className="flex items-center space-x-3 p-2 mb-6">
              <LogoIcon className="w-8 h-8" />
              <h1 className="text-xl font-bold tracking-tight text-gray-900">MediMind</h1>
          </div>
          
          <div className="flex-1 flex flex-col min-h-0">
            <DocumentManager 
              documents={documents}
              selectedDocumentId={selectedDocumentId}
              onDocumentsUpload={handleDocumentsUpload}
              onDocumentSelect={handleDocumentSelect}
              onDocumentDelete={handleDocumentDelete}
            />
          </div>

          <div className="py-2">
            <SettingsSection>
                <PersonaSelector selectedPersona={persona} onPersonaChange={setPersona} />
                <VoiceSelector selectedVoice={voice} onVoiceChange={setVoice} />
                <ModelSelector selectedModel={model} onModelChange={setModel} />
            </SettingsSection>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full bg-gray-50">
          {selectedDocument && model.startsWith('gemini') ? (
            <ChatInterface 
              key={`${selectedDocument.id}-${model}`} // Re-mounts component on doc or model change
              document={selectedDocument} 
              documentId={selectedDocument.id} 
              documentName={selectedDocument.name} 
              persona={persona} 
              modelName={model}
              voice={voice}
              suggestedQuestions={suggestedQuestions}
              isGeneratingSuggestions={isGeneratingSuggestions}
            />
          ) : selectedDocument && model === 'llama3' ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="p-4 bg-red-500 rounded-full mb-6 shadow-lg">
                <CpuChipIcon className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-800 mb-2">
                LLaMA 3 Not Available
              </h2>
              <p className="max-w-md text-gray-500">
                This application is currently configured to use the Google Gemini API directly from the browser. Full integration with other models like LLaMA 3 would require a different backend architecture.
              </p>
            </div>
          ) : (
            <WelcomeScreen />
          )}
        </main>

        {/* Right Sidebar */}
        {selectedDocument && (
          <aside className="w-[360px] flex-shrink-0 h-full flex flex-col bg-white p-4 border-l border-gray-200">
              <SummarySection 
                summary={summary}
                isSummarizing={isSummarizing}
                summaryFocus={summaryFocus}
                onSummaryFocusChange={setSummaryFocus}
              />
          </aside>
        )}
      </div>
    </div>
  );
};

export default App;