import React, { useState } from 'react';
import { LogFile, RepoContext } from '../types';

interface UploadPanelProps {
  onFilesChange: (files: LogFile[]) => void;
  onRepoContextChange: (ctx: RepoContext) => void;
  repoContext: RepoContext;
  files: LogFile[];
}

export const UploadPanel: React.FC<UploadPanelProps> = ({ 
  onFilesChange, 
  onRepoContextChange, 
  repoContext,
  files 
}) => {
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const newFile: LogFile = {
          name: file.name,
          content: content,
          type: file.name.endsWith('.json') || file.name.endsWith('.yaml') || file.name.endsWith('.xml') ? 'config' : 'log'
        };
        onFilesChange([...files, newFile]);
      };
      reader.readAsText(file);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  return (
    <div className="h-full flex flex-col bg-dark-800 border-r border-dark-700 w-80 shrink-0 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-primary-500 font-bold text-xl mb-1 tracking-tight">LOG SENTINAL</h2>
        <p className="text-xs text-gray-400 mb-6">AI-Powered Root Cause Analysis</p>

        {/* File Upload Section */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Log Artifacts</h3>
          
          <div className="space-y-3">
            {files.map((file, idx) => (
              <div key={idx} className="bg-dark-700 rounded p-3 flex items-center justify-between group border border-gray-700 hover:border-primary-500/50 transition-colors">
                <div className="flex items-center overflow-hidden">
                  <svg className="w-4 h-4 text-primary-500 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span className="text-sm text-gray-200 truncate font-mono">{file.name}</span>
                </div>
                <button onClick={() => removeFile(idx)} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}

            <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-dark-700/50 transition-all group">
              <div className="flex flex-col items-center pt-5 pb-6">
                <svg className="w-8 h-8 text-gray-500 group-hover:text-primary-500 mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                <p className="text-xs text-gray-400 group-hover:text-gray-300">Click to upload .log or .txt</p>
              </div>
              <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        </div>

        {/* Repo Context Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
             <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Repository Context</h3>
             <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={repoContext.hasAccess} 
                  onChange={(e) => onRepoContextChange({...repoContext, hasAccess: e.target.checked})}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 bg-dark-700 border-gray-600"
                />
                <span className="ml-2 text-xs text-gray-400">Enable Access</span>
             </div>
          </div>

          {repoContext.hasAccess && (
            <div className="space-y-3 animate-fade-in">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Repo URL (Bitbucket/Git)</label>
                <input 
                  type="text" 
                  value={repoContext.repoUrl}
                  onChange={(e) => onRepoContextChange({...repoContext, repoUrl: e.target.value})}
                  placeholder="https://bitbucket.org/org/repo"
                  className="w-full bg-dark-900 border border-gray-700 rounded px-3 py-2 text-xs text-gray-200 focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Branch</label>
                  <input 
                    type="text" 
                    value={repoContext.branch}
                    onChange={(e) => onRepoContextChange({...repoContext, branch: e.target.value})}
                    placeholder="main"
                    className="w-full bg-dark-900 border border-gray-700 rounded px-3 py-2 text-xs text-gray-200 focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Build/Commit</label>
                  <input 
                    type="text" 
                    value={repoContext.buildVersion}
                    onChange={(e) => onRepoContextChange({...repoContext, buildVersion: e.target.value})}
                    placeholder="v1.0.4-sha"
                    className="w-full bg-dark-900 border border-gray-700 rounded px-3 py-2 text-xs text-gray-200 focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Pasted Code Snippet (Optional)</label>
                <textarea 
                  rows={4}
                  value={repoContext.customSnippet || ''}
                  onChange={(e) => onRepoContextChange({...repoContext, customSnippet: e.target.value})}
                  placeholder="Paste relevant class or config file content here..."
                  className="w-full bg-dark-900 border border-gray-700 rounded px-3 py-2 text-xs text-gray-200 font-mono focus:border-primary-500 focus:outline-none resize-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-auto p-6 border-t border-dark-700">
        <div className="flex items-center text-xs text-gray-500">
          <div className={`w-2 h-2 rounded-full mr-2 ${repoContext.hasAccess ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-600'}`}></div>
          Bitbucket Link: {repoContext.hasAccess ? 'Active' : 'Disconnected'}
        </div>
      </div>
    </div>
  );
};