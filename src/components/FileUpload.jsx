import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  X, 
  File, 
  Image, 
  FileText, 
  Download, 
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNotifications } from '../contexts/NotificationContext';

const FileUpload = ({
  bucket = 'documents',
  path = '',
  allowMultiple = true,
  acceptedTypes = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'text/plain': ['.txt'],
    'text/csv': ['.csv']
  },
  maxFileSize = 10 * 1024 * 1024, // 10MB
  onUploadComplete = () => {},
  onFileRemove = () => {},
  initialFiles = [],
  className = '',
  label = 'Fazer upload de arquivos',
  description = 'Arraste arquivos aqui ou clique para selecionar'
}) => {
  const [files, setFiles] = useState(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const { notifySuccess, notifyError, notifyInfo } = useNotifications();

  // Validar tipo de arquivo
  const isValidFileType = (file) => {
    const acceptedTypesArray = Object.keys(acceptedTypes);
    return acceptedTypesArray.some(type => {
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });
  };

  // Validar tamanho do arquivo
  const isValidFileSize = (file) => {
    return file.size <= maxFileSize;
  };

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Obter ícone do arquivo baseado no tipo
  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-6 h-6 text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="w-6 h-6 text-red-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="w-6 h-6 text-blue-600" />;
    } else if (fileType.includes('excel') || fileType.includes('sheet')) {
      return <FileText className="w-6 h-6 text-green-600" />;
    } else {
      return <File className="w-6 h-6 text-gray-500" />;
    }
  };

  // Upload de arquivo para o Supabase Storage
  const uploadFileToStorage = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = path ? `${path}/${fileName}` : fileName;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return {
        success: true,
        data: {
          path: filePath,
          url: publicUrl,
          name: file.name,
          size: file.size,
          type: file.type
        }
      };
    } catch (error) {
      console.error('Erro no upload:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Processar arquivos selecionados
  const processFiles = useCallback(async (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    const validFiles = [];
    const errors = [];

    // Validar cada arquivo
    fileArray.forEach((file) => {
      if (!isValidFileType(file)) {
        errors.push(`${file.name}: Tipo de arquivo não permitido`);
        return;
      }

      if (!isValidFileSize(file)) {
        errors.push(`${file.name}: Arquivo muito grande (máximo ${formatFileSize(maxFileSize)})`);
        return;
      }

      validFiles.push({
        file,
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'pending',
        progress: 0,
        url: null,
        path: null
      });
    });

    // Mostrar erros se houver
    if (errors.length > 0) {
      notifyError('❌ Erro nos arquivos', errors.join(', '));
    }

    // Adicionar arquivos válidos à lista
    if (validFiles.length > 0) {
      if (allowMultiple) {
        setFiles(prev => [...prev, ...validFiles]);
      } else {
        setFiles(validFiles);
      }

      // Fazer upload dos arquivos
      await uploadFiles(validFiles);
    }
  }, [allowMultiple, maxFileSize, notifyError]);

  // Fazer upload dos arquivos
  const uploadFiles = async (filesToUpload) => {
    setUploading(true);

    for (const fileItem of filesToUpload) {
      try {
        // Atualizar status para uploading
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'uploading', progress: 50 }
            : f
        ));

        // Fazer upload
        const result = await uploadFileToStorage(fileItem.file);

        if (result.success) {
          // Atualizar com sucesso
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id 
              ? { 
                  ...f, 
                  status: 'success', 
                  progress: 100,
                  url: result.data.url,
                  path: result.data.path
                }
              : f
          ));

          notifySuccess('✅ Upload concluído', `${fileItem.name} foi enviado com sucesso`);
          onUploadComplete(result.data);
        } else {
          // Atualizar com erro
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id 
              ? { ...f, status: 'error', progress: 0, error: result.error }
              : f
          ));

          notifyError('❌ Erro no upload', `Falha ao enviar ${fileItem.name}: ${result.error}`);
        }
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'error', progress: 0, error: error.message }
            : f
        ));

        notifyError('❌ Erro no upload', `Falha ao enviar ${fileItem.name}: ${error.message}`);
      }
    }

    setUploading(false);
  };

  // Remover arquivo
  const removeFile = async (fileId) => {
    const fileToRemove = files.find(f => f.id === fileId);
    
    if (fileToRemove && fileToRemove.path) {
      try {
        // Remover do storage
        const { error } = await supabase.storage
          .from(bucket)
          .remove([fileToRemove.path]);

        if (error) {
          console.error('Erro ao remover arquivo do storage:', error);
        }
      } catch (error) {
        console.error('Erro ao remover arquivo:', error);
      }
    }

    // Remover da lista
    setFiles(prev => prev.filter(f => f.id !== fileId));
    onFileRemove(fileToRemove);
  };

  // Preview de arquivo
  const previewFile = (file) => {
    if (file.url && file.type.startsWith('image/')) {
      window.open(file.url, '_blank');
    } else if (file.url) {
      window.open(file.url, '_blank');
    }
  };

  // Download de arquivo
  const downloadFile = (file) => {
    if (file.url) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Drag & Drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  // Abrir seletor de arquivos
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  // Handler para seleção de arquivos
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={allowMultiple}
          accept={Object.keys(acceptedTypes).join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="space-y-4">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
            dragActive ? 'bg-blue-500' : 'bg-gray-100'
          }`}>
            <Upload className={`w-8 h-8 ${dragActive ? 'text-white' : 'text-gray-400'}`} />
          </div>

          <div>
            <p className={`text-lg font-medium ${dragActive ? 'text-blue-600' : 'text-gray-900'}`}>
              {dragActive ? 'Solte os arquivos aqui' : description}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {Object.values(acceptedTypes).flat().join(', ')} - Máximo {formatFileSize(maxFileSize)}
            </p>
          </div>

          {uploading && (
            <div className="flex items-center justify-center gap-2">
              <Loader className="w-5 h-5 animate-spin text-blue-500" />
              <span className="text-sm text-blue-600">Fazendo upload...</span>
            </div>
          )}
        </div>
      </div>

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Arquivos ({files.length})
          </h4>

          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200"
              >
                {/* Ícone do arquivo */}
                <div className="flex-shrink-0">
                  {getFileIcon(file.type)}
                </div>

                {/* Informações do arquivo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 mt-1">
                    {file.status === 'pending' && (
                      <span className="text-xs text-gray-500">Aguardando...</span>
                    )}
                    
                    {file.status === 'uploading' && (
                      <>
                        <div className="w-32 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-blue-600">{file.progress}%</span>
                      </>
                    )}

                    {file.status === 'success' && (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-600">Upload concluído</span>
                      </>
                    )}

                    {file.status === 'error' && (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="text-xs text-red-600">
                          {file.error || 'Erro no upload'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-1">
                  {file.status === 'success' && file.url && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          previewFile(file);
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadFile(file);
                        }}
                        className="p-2 text-gray-500 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 