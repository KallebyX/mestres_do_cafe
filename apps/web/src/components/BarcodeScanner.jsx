import React, { useState, useRef, useEffect } from 'react';
import { 
  Scan, X, Package, Check, AlertCircle, 
  Camera, Download, Upload, Plus, Search
} from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { supabase } from "@/lib/api"

const BarcodeScanner = ({ 
  isOpen, 
  onClose, 
  onBarcodeScanned,
  mode = 'scan' // 'scan' | 'generate'
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [error, setError] = useState('');
  const [generatedBarcode, setGeneratedBarcode] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const { notifySuccess, notifyError } = useNotifications();

  // Carregar produtos reais do Supabase
  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  const loadProducts = async () => {
    try {
      // Buscar produtos com código de barras do Supabase
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, barcode, price')
        .not('barcode', 'is', null)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Erro ao buscar produtos:', error);
        setProducts([]);
      } else {
        setProducts(data || []);
        console.log(`✅ ${data?.length || 0} produtos com código de barras carregados do Supabase`);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar produtos:', error);
      setProducts([]);
    }
  };

  const startCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsScanning(true);
    } catch (error) {
      setError('Erro ao acessar câmera. Verifique as permissões.');
      console.error('Erro ao acessar câmera:', error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // Simulação de leitura de código de barras
  const simulateBarcodeRead = (code) => {
    const product = products.find(p => p.barcode === code);
    if (product) {
      setScannedCode(code);
      setSelectedProduct(product);
      notifySuccess('✅ Código Lido', `Produto: ${product.name}`);
      if (onBarcodeScanned) {
        onBarcodeScanned(product);
      }
    } else {
      setError('Produto não encontrado');
      notifyError('❌ Produto não encontrado', 'Código de barras não cadastrado');
    }
  };

  const handleManualInput = () => {
    if (manualCode.length >= 8) {
      simulateBarcodeRead(manualCode);
    } else {
      setError('Código deve ter pelo menos 8 dígitos');
    }
  };

  const generateBarcode = () => {
    // Gerar código EAN-13 simples
    const timestamp = Date.now().toString();
    const randomDigits = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const baseCode = '789' + timestamp.slice(-6) + randomDigits;
    
    // Calcular dígito verificador EAN-13
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(baseCode[i]);
      sum += i % 2 === 0 ? digit : digit * 3;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    
    const fullCode = baseCode + checkDigit;
    setGeneratedBarcode(fullCode);
    notifySuccess('✅ Código Gerado', `Novo código: ${fullCode}`);
  };

  const downloadBarcode = () => {
    // Simular download do código de barras
    const canvas = canvasRef.current;
    if (canvas && generatedBarcode) {
      const ctx = canvas.getContext('2d');
      canvas.width = 300;
      canvas.height = 100;
      
      // Desenhar código de barras simples
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Simular barras
      for (let i = 0; i < generatedBarcode.length; i++) {
        const digit = parseInt(generatedBarcode[i]);
        const barWidth = digit + 1;
        const x = i * 20;
        
        ctx.fillStyle = i % 2 === 0 ? '#000000' : '#ffffff';
        ctx.fillRect(x, 10, barWidth, 60);
      }
      
      // Adicionar texto
      ctx.fillStyle = '#000000';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(generatedBarcode, canvas.width / 2, 90);
      
      // Download
      const link = document.createElement('a');
      link.download = `barcode-${generatedBarcode}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      notifySuccess('✅ Download Concluído', 'Código de barras baixado');
    }
  };

  const handleClose = () => {
    stopCamera();
    setScannedCode('');
    setSelectedProduct(null);
    setError('');
    setGeneratedBarcode('');
    setManualCode('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <Scan className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">
                {mode === 'scan' ? 'Scanner de Código de Barras' : 'Gerador de Código de Barras'}
              </h2>
              <p className="text-blue-100">
                {mode === 'scan' ? 'Escaneie ou digite o código manualmente' : 'Gerar novos códigos de barras'}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {mode === 'scan' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Scanner */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Scanner de Câmera
                </h3>

                <div className="bg-gray-100 rounded-xl p-6 text-center">
                  {!isScanning ? (
                    <div>
                      <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        Clique para ativar a câmera e escanear código de barras
                      </p>
                      <button
                        onClick={startCamera}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 mx-auto"
                      >
                        <Camera className="w-5 h-5" />
                        Ativar Câmera
                      </button>
                    </div>
                  ) : (
                    <div>
                      <video
                        ref={videoRef}
                        className="w-full max-w-md mx-auto rounded-lg mb-4"
                        autoPlay
                        playsInline
                      />
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={stopCamera}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          Parar Scanner
                        </button>
                        <button
                          onClick={() => simulateBarcodeRead('7891234567890')}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          Simular Scan
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Manual */}
                <div className="mt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Entrada Manual
                  </h4>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Digite o código de barras"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleManualInput()}
                    />
                    <button
                      onClick={handleManualInput}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                    >
                      Buscar
                    </button>
                  </div>
                </div>
              </div>

              {/* Resultado */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Resultado
                </h3>

                {selectedProduct ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-green-900">Produto Encontrado!</h4>
                        <p className="text-green-700">Código: {scannedCode}</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <h5 className="font-semibold text-gray-900 mb-2">{selectedProduct.name}</h5>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">SKU:</span>
                          <span className="ml-2 font-semibold">{selectedProduct.sku}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Preço:</span>
                          <span className="ml-2 font-semibold text-green-600">
                            R$ {selectedProduct.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Código de Barras:</span>
                          <span className="ml-2 font-mono font-semibold">{selectedProduct.barcode}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-xl p-6 text-center">
                    <Scan className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Nenhum código escaneado ainda
                    </p>
                  </div>
                )}

                {/* Lista de Produtos Disponíveis */}
                <div className="mt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">
                    Produtos Cadastrados
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {products.map(product => (
                      <div 
                        key={product.id}
                        onClick={() => simulateBarcodeRead(product.barcode)}
                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-600 font-mono">{product.barcode}</p>
                          </div>
                          <span className="text-green-600 font-semibold">
                            R$ {product.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Modo Geração */
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" />
                Gerador de Código de Barras
              </h3>

              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <button
                  onClick={generateBarcode}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 mx-auto mb-6"
                >
                  <Plus className="w-5 h-5" />
                  Gerar Novo Código
                </button>

                {generatedBarcode && (
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Código Gerado:</p>
                      <p className="text-2xl font-mono font-bold text-gray-900">
                        {generatedBarcode}
                      </p>
                    </div>

                    {/* Canvas para visualização do código de barras */}
                    <canvas 
                      ref={canvasRef}
                      className="border border-gray-200 rounded-lg mb-4 mx-auto"
                      style={{ maxWidth: '100%' }}
                    />

                    <button
                      onClick={downloadBarcode}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Download className="w-4 h-4" />
                      Baixar Imagem
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner; 