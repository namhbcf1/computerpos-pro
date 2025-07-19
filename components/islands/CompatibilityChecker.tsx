// ComputerPOS Pro - AI-Powered Compatibility Checker
// Real-time component compatibility validation for Vietnamese computer stores

import React, { useState, useEffect } from 'react';
import { Component, CompatibilityResult } from '../../lib/compatibility/engine';

interface SelectedComponent {
  category: string;
  component: Component | null;
}

interface BuildProfile {
  name: string;
  useCase: string;
  budget: number;
  components: SelectedComponent[];
}

export function CompatibilityChecker() {
  const [selectedComponents, setSelectedComponents] = useState<SelectedComponent[]>([
    { category: 'CPU', component: null },
    { category: 'Motherboard', component: null },
    { category: 'RAM', component: null },
    { category: 'GPU', component: null },
    { category: 'Storage', component: null },
    { category: 'PSU', component: null },
    { category: 'Case', component: null },
    { category: 'Cooling', component: null }
  ]);
  
  const [availableComponents, setAvailableComponents] = useState<Component[]>([]);
  const [compatibilityResult, setCompatibilityResult] = useState<CompatibilityResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [buildProfiles, setBuildProfiles] = useState<BuildProfile[]>([]);
  const [currentBudget, setCurrentBudget] = useState(30000000); // 30 triệu VND default

  // Load available components
  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const response = await fetch('/api/products');
        const result = await response.json();
        
        if (result.success) {
          setAvailableComponents(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch components:', error);
      }
    };

    fetchComponents();
  }, []);

  // Auto-check compatibility when components change
  useEffect(() => {
    const hasComponents = selectedComponents.some(sc => sc.component !== null);
    if (hasComponents) {
      checkCompatibility();
    }
  }, [selectedComponents]);

  const checkCompatibility = async () => {
    setIsChecking(true);
    
    try {
      const components = selectedComponents
        .filter(sc => sc.component !== null)
        .map(sc => sc.component!);

      const response = await fetch('/api/ai/compatibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          components,
          buildType: 'gaming', // Could be dynamic
          budget: currentBudget
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setCompatibilityResult(result.data);
      } else {
        console.error('Compatibility check failed:', result.error);
      }
    } catch (error) {
      console.error('Compatibility check error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const selectComponent = (category: string, component: Component) => {
    setSelectedComponents(prev => 
      prev.map(sc => 
        sc.category === category 
          ? { ...sc, component }
          : sc
      )
    );
  };

  const removeComponent = (category: string) => {
    setSelectedComponents(prev => 
      prev.map(sc => 
        sc.category === category 
          ? { ...sc, component: null }
          : sc
      )
    );
  };

  const calculateTotalPrice = () => {
    return selectedComponents.reduce((total, sc) => {
      return total + (sc.component?.price || 0);
    }, 0);
  };

  const formatVNDPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompatibilityBadge = (score: number) => {
    if (score >= 90) return { text: 'Tuyệt vời', color: 'bg-green-100 text-green-800' };
    if (score >= 70) return { text: 'Tốt', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Cần cải thiện', color: 'bg-red-100 text-red-800' };
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            🔧 Kiểm Tra Tương Thích Linh Kiện
          </h2>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Tổng giá trị</p>
              <p className="text-xl font-bold text-blue-600">
                {formatVNDPrice(calculateTotalPrice())}
              </p>
            </div>
            {compatibilityResult && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Điểm tương thích</p>
                <div className="flex items-center space-x-2">
                  <span className={`text-2xl font-bold ${getCompatibilityColor(compatibilityResult.performanceScore)}`}>
                    {compatibilityResult.performanceScore}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCompatibilityBadge(compatibilityResult.performanceScore).color}`}>
                    {getCompatibilityBadge(compatibilityResult.performanceScore).text}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Budget Slider */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ngân sách: {formatVNDPrice(currentBudget)}
          </label>
          <input
            type="range"
            min="10000000"
            max="100000000"
            step="1000000"
            value={currentBudget}
            onChange={(e) => setCurrentBudget(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10 triệu</span>
            <span>50 triệu</span>
            <span>100 triệu</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Component Selection */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Chọn Linh Kiện</h3>
          
          {selectedComponents.map((sc) => (
            <ComponentSelector
              key={sc.category}
              category={sc.category}
              selectedComponent={sc.component}
              availableComponents={availableComponents.filter(c => c.category === sc.category)}
              onSelect={(component) => selectComponent(sc.category, component)}
              onRemove={() => removeComponent(sc.category)}
            />
          ))}
        </div>

        {/* Compatibility Results */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Kết Quả Kiểm Tra</h3>
          
          {isChecking ? (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Đang kiểm tra...</span>
              </div>
            </div>
          ) : compatibilityResult ? (
            <CompatibilityResults result={compatibilityResult} />
          ) : (
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
              <p className="text-gray-500">Chọn linh kiện để kiểm tra tương thích</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ComponentSelectorProps {
  category: string;
  selectedComponent: Component | null;
  availableComponents: Component[];
  onSelect: (component: Component) => void;
  onRemove: () => void;
}

function ComponentSelector({ 
  category, 
  selectedComponent, 
  availableComponents, 
  onSelect, 
  onRemove 
}: ComponentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const categoryIcons = {
    CPU: '🔧',
    Motherboard: '🔌',
    RAM: '💾',
    GPU: '🎮',
    Storage: '💿',
    PSU: '⚡',
    Case: '📦',
    Cooling: '❄️'
  };

  const categoryNames = {
    CPU: 'Bộ vi xử lý',
    Motherboard: 'Bo mạch chủ',
    RAM: 'Bộ nhớ',
    GPU: 'Card đồ họa',
    Storage: 'Ổ cứng',
    PSU: 'Nguồn',
    Case: 'Vỏ máy',
    Cooling: 'Tản nhiệt'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <span className="text-xl mr-2">{categoryIcons[category]}</span>
          <h4 className="font-medium text-gray-900">{categoryNames[category]}</h4>
        </div>
        {selectedComponent && (
          <button
            onClick={onRemove}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Xóa
          </button>
        )}
      </div>

      {selectedComponent ? (
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <p className="font-medium text-blue-900">{selectedComponent.name}</p>
          <p className="text-sm text-blue-700">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(selectedComponent.price)}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Kho: {selectedComponent.stock} sản phẩm
          </p>
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full text-left p-3 border border-gray-300 rounded hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <span className="text-gray-500">Chọn {categoryNames[category].toLowerCase()}...</span>
          </button>
          
          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {availableComponents.length > 0 ? (
                availableComponents.map((component) => (
                  <button
                    key={component.id}
                    onClick={() => {
                      onSelect(component);
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <p className="font-medium text-gray-900">{component.name}</p>
                    <p className="text-sm text-gray-600">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(component.price)}
                    </p>
                  </button>
                ))
              ) : (
                <div className="p-3 text-gray-500 text-center">
                  Không có sản phẩm
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface CompatibilityResultsProps {
  result: CompatibilityResult;
}

function CompatibilityResults({ result }: CompatibilityResultsProps) {
  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <div className={`rounded-lg p-4 ${
        result.compatible 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center">
          <span className="text-2xl mr-2">
            {result.compatible ? '✅' : '❌'}
          </span>
          <div>
            <p className={`font-medium ${
              result.compatible ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.compatible ? 'Tương thích' : 'Có vấn đề'}
            </p>
            <p className={`text-sm ${
              result.compatible ? 'text-green-600' : 'text-red-600'
            }`}>
              Điểm: {result.performanceScore}/100
            </p>
          </div>
        </div>
      </div>

      {/* Issues */}
      {result.issues.length > 0 && (
        <div className="bg-white rounded-lg border p-4">
          <h4 className="font-medium text-gray-900 mb-3">⚠️ Vấn đề cần khắc phục</h4>
          <div className="space-y-2">
            {result.issues.map((issue, index) => (
              <div key={index} className={`p-3 rounded ${
                issue.type === 'critical' 
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <p className={`text-sm font-medium ${
                  issue.type === 'critical' ? 'text-red-800' : 'text-yellow-800'
                }`}>
                  {issue.message}
                </p>
                {issue.solution && (
                  <p className={`text-xs mt-1 ${
                    issue.type === 'critical' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    💡 {issue.solution}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <div className="bg-white rounded-lg border p-4">
          <h4 className="font-medium text-gray-900 mb-3">💡 Khuyến nghị</h4>
          <div className="space-y-2">
            {result.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <p className="text-sm text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights */}
      {result.aiInsights && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4">
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center mr-2">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <h4 className="font-medium text-gray-900">Phân tích AI</h4>
          </div>
          <p className="text-sm text-gray-700">{result.aiInsights}</p>
        </div>
      )}
    </div>
  );
}
