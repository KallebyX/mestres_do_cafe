import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Image, 
  File,
  Info,
  CheckCircle
} from 'lucide-react';
import FileUpload from '../components/FileUpload';
import { useNotifications } from '../contexts/NotificationContext';

const FileUploadDemo = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const { notifySuccess } = useNotifications();

  const handleFileUploadComplete = (fileData) => {
    setUploadedFiles(prev => [...prev, fileData]);
  };

  const handleFileRemove = (removedFile) => {
    setUploadedFiles(prev => prev.filter(f => f.path !== removedFile.path));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema de Upload de Arquivos
          </h1>
          <p className="text-gray-600">
            Demonstração do componente de upload com drag & drop, validação e integração com Supabase Storage
          </p>
        </div>

        {/* Funcionalidades */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Funcionalidades</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-blue-800">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Drag & Drop</span>
            </div>
            <div className="flex items-center gap-2 text-blue-800">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Validação de tipo</span>
            </div>
            <div className="flex items-center gap-2 text-blue-800">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Validação de tamanho</span>
            </div>
            <div className="flex items-center gap-2 text-blue-800">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Preview de arquivos</span>
            </div>
            <div className="flex items-center gap-2 text-blue-800">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Progress tracking</span>
            </div>
            <div className="flex items-center gap-2 text-blue-800">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Integração Supabase</span>
            </div>
          </div>
        </div>

        {/* Exemplos de Uso */}
        <div className="space-y-8">
          {/* Upload Geral */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Geral de Documentos</h2>
            <p className="text-gray-600 mb-6">
              Aceita diversos tipos de arquivo: imagens, PDFs, documentos do Office, planilhas e arquivos de texto.
            </p>
            
            <FileUpload
              bucket="documents"
              path="geral"
              allowMultiple={true}
              label="Documentos Gerais"
              description="Arraste seus documentos aqui ou clique para selecionar"
              onUploadComplete={handleFileUploadComplete}
              onFileRemove={handleFileRemove}
            />
          </div>

          {/* Upload de Imagens */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload de Imagens</h2>
            <p className="text-gray-600 mb-6">
              Específico para imagens: PNG, JPG, JPEG, GIF e WebP.
            </p>
            
            <FileUpload
              bucket="images"
              path="produtos"
              allowMultiple={true}
              acceptedTypes={{
                'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
              }}
              maxFileSize={5 * 1024 * 1024} // 5MB
              label="Imagens de Produtos"
              description="Apenas imagens - máximo 5MB cada"
              onUploadComplete={handleFileUploadComplete}
              onFileRemove={handleFileRemove}
            />
          </div>

          {/* Upload de PDF */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload de Relatórios (PDF)</h2>
            <p className="text-gray-600 mb-6">
              Apenas arquivos PDF para relatórios e documentos oficiais.
            </p>
            
            <FileUpload
              bucket="reports"
              path="2024"
              allowMultiple={false}
              acceptedTypes={{
                'application/pdf': ['.pdf']
              }}
              maxFileSize={20 * 1024 * 1024} // 20MB
              label="Relatório Mensal"
              description="Selecione um arquivo PDF - máximo 20MB"
              onUploadComplete={handleFileUploadComplete}
              onFileRemove={handleFileRemove}
            />
          </div>

          {/* Upload de Planilhas */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload de Planilhas</h2>
            <p className="text-gray-600 mb-6">
              Para arquivos Excel, CSV e planilhas do LibreOffice.
            </p>
            
            <FileUpload
              bucket="spreadsheets"
              path="importacao"
              allowMultiple={true}
              acceptedTypes={{
                'application/vnd.ms-excel': ['.xls'],
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                'text/csv': ['.csv']
              }}
              maxFileSize={15 * 1024 * 1024} // 15MB
              label="Planilhas para Importação"
              description="Excel (.xls, .xlsx) ou CSV - máximo 15MB"
              onUploadComplete={handleFileUploadComplete}
              onFileRemove={handleFileRemove}
            />
          </div>
        </div>

        {/* Arquivos Enviados */}
        {uploadedFiles.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Arquivos Enviados ({uploadedFiles.length})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center gap-3 mb-3">
                    {file.type.startsWith('image/') ? (
                      <Image className="w-6 h-6 text-blue-500" />
                    ) : file.type === 'application/pdf' ? (
                      <FileText className="w-6 h-6 text-red-500" />
                    ) : (
                      <File className="w-6 h-6 text-gray-500" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs text-gray-600">
                      <strong>Bucket:</strong> {file.path.split('/')[0] || 'root'}
                    </div>
                    <div className="text-xs text-gray-600">
                      <strong>Caminho:</strong> {file.path}
                    </div>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                    >
                      <Upload className="w-3 h-3" />
                      Ver arquivo
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documentação de Uso */}
        <div className="mt-8 bg-gray-900 rounded-2xl shadow-lg p-6 text-white">
          <h2 className="text-xl font-bold mb-4">Como Usar o Componente</h2>
          
          <div className="bg-gray-800 rounded-xl p-4 overflow-x-auto">
            <pre className="text-sm text-green-400">
{`import FileUpload from '../components/FileUpload';

// Uso básico
<FileUpload
  bucket="documents"          // Bucket do Supabase Storage
  path="uploads"             // Pasta dentro do bucket
  allowMultiple={true}       // Permitir múltiplos arquivos
  maxFileSize={10485760}     // 10MB em bytes
  onUploadComplete={(file) => {
    console.log('Arquivo enviado:', file);
  }}
  onFileRemove={(file) => {
    console.log('Arquivo removido:', file);
  }}
/>

// Apenas imagens
<FileUpload
  bucket="images"
  acceptedTypes={{
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
  }}
  maxFileSize={5242880}      // 5MB
  allowMultiple={false}      // Apenas um arquivo
/>

// Personalização
<FileUpload
  label="Seus documentos"
  description="Arraste aqui ou clique para enviar"
  className="custom-upload"
  initialFiles={existingFiles}
/>`}
            </pre>
          </div>
          
          <div className="mt-4 text-sm text-gray-300">
            <h3 className="font-semibold mb-2">Props disponíveis:</h3>
            <ul className="space-y-1 text-xs">
              <li><code className="text-blue-300">bucket</code> - Bucket do Supabase Storage</li>
              <li><code className="text-blue-300">path</code> - Caminho dentro do bucket</li>
              <li><code className="text-blue-300">allowMultiple</code> - Permite múltiplos arquivos</li>
              <li><code className="text-blue-300">acceptedTypes</code> - Tipos de arquivo aceitos</li>
              <li><code className="text-blue-300">maxFileSize</code> - Tamanho máximo em bytes</li>
              <li><code className="text-blue-300">onUploadComplete</code> - Callback ao completar upload</li>
              <li><code className="text-blue-300">onFileRemove</code> - Callback ao remover arquivo</li>
              <li><code className="text-blue-300">initialFiles</code> - Arquivos já existentes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadDemo; 