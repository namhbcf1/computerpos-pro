// ComputerPOS Pro - Component Compatibility Engine
// AI-powered compatibility checking for computer hardware

export interface Component {
  id: string;
  name: string;
  category: ComponentCategory;
  specifications: ComponentSpecs;
  price: number;
  stock: number;
}

export type ComponentCategory = 
  | 'CPU' 
  | 'GPU' 
  | 'Motherboard' 
  | 'RAM' 
  | 'Storage' 
  | 'PSU' 
  | 'Cooling' 
  | 'Case';

export interface ComponentSpecs {
  // CPU Specifications
  socket?: string; // LGA1700, AM5, AM4
  cores?: number;
  threads?: number;
  tdp?: number; // Thermal Design Power
  
  // GPU Specifications
  vramSize?: number; // GB
  powerRequirement?: number; // Watts
  length?: number; // mm
  slots?: number; // PCIe slots required
  
  // Motherboard Specifications
  chipset?: string; // Z790, X670, B650
  ramSlots?: number;
  maxRamCapacity?: number; // GB
  ramType?: 'DDR4' | 'DDR5';
  pciSlots?: number;
  m2Slots?: number;
  
  // RAM Specifications
  type?: 'DDR4' | 'DDR5';
  speed?: number; // MHz
  capacity?: number; // GB per stick
  voltage?: number;
  
  // PSU Specifications
  wattage?: number;
  efficiency?: string; // 80+ Bronze, Gold, Platinum
  modular?: boolean;
  
  // Storage Specifications
  interface?: 'SATA' | 'NVMe' | 'M.2';
  capacity?: number; // GB
  readSpeed?: number; // MB/s
  writeSpeed?: number; // MB/s
}

export interface CompatibilityResult {
  compatible: boolean;
  issues: CompatibilityIssue[];
  warnings: CompatibilityWarning[];
  recommendations: string[];
  performanceScore: number; // 0-100
}

export interface CompatibilityIssue {
  type: 'critical' | 'warning' | 'info';
  component1: string;
  component2: string;
  message: string;
  solution?: string;
}

export interface CompatibilityWarning {
  type: 'bottleneck' | 'power' | 'thermal' | 'physical';
  message: string;
  impact: 'low' | 'medium' | 'high';
}

export class CompatibilityEngine {
  private components: Component[] = [];
  
  constructor(components: Component[]) {
    this.components = components;
  }

  /**
   * Kiểm tra tương thích toàn diện cho một build PC
   */
  async checkBuildCompatibility(selectedComponents: Component[]): Promise<CompatibilityResult> {
    const issues: CompatibilityIssue[] = [];
    const warnings: CompatibilityWarning[] = [];
    const recommendations: string[] = [];
    
    // 1. Kiểm tra CPU - Motherboard compatibility
    const cpuMbCompatibility = this.checkCPUMotherboardCompatibility(selectedComponents);
    if (cpuMbCompatibility.issues.length > 0) {
      issues.push(...cpuMbCompatibility.issues);
    }
    
    // 2. Kiểm tra RAM compatibility
    const ramCompatibility = this.checkRAMCompatibility(selectedComponents);
    if (ramCompatibility.issues.length > 0) {
      issues.push(...ramCompatibility.issues);
    }
    
    // 3. Kiểm tra PSU requirements
    const psuCompatibility = this.checkPSUCompatibility(selectedComponents);
    if (psuCompatibility.issues.length > 0) {
      issues.push(...psuCompatibility.issues);
    }
    
    // 4. Kiểm tra physical clearance
    const physicalCompatibility = this.checkPhysicalCompatibility(selectedComponents);
    if (physicalCompatibility.issues.length > 0) {
      issues.push(...physicalCompatibility.issues);
    }
    
    // 5. Phân tích performance bottlenecks
    const bottleneckAnalysis = this.analyzeBottlenecks(selectedComponents);
    warnings.push(...bottleneckAnalysis.warnings);
    
    // 6. Tạo recommendations
    recommendations.push(...this.generateRecommendations(selectedComponents, issues, warnings));
    
    // 7. Tính performance score
    const performanceScore = this.calculatePerformanceScore(selectedComponents, issues, warnings);
    
    return {
      compatible: issues.filter(i => i.type === 'critical').length === 0,
      issues,
      warnings,
      recommendations,
      performanceScore
    };
  }

  /**
   * Kiểm tra tương thích CPU - Motherboard
   */
  private checkCPUMotherboardCompatibility(components: Component[]): { issues: CompatibilityIssue[] } {
    const issues: CompatibilityIssue[] = [];
    const cpu = components.find(c => c.category === 'CPU');
    const motherboard = components.find(c => c.category === 'Motherboard');
    
    if (!cpu || !motherboard) return { issues };
    
    // Kiểm tra socket compatibility
    if (cpu.specifications.socket !== motherboard.specifications.socket) {
      issues.push({
        type: 'critical',
        component1: cpu.name,
        component2: motherboard.name,
        message: `Socket không tương thích: ${cpu.specifications.socket} vs ${motherboard.specifications.socket}`,
        solution: `Chọn CPU với socket ${motherboard.specifications.socket} hoặc motherboard với socket ${cpu.specifications.socket}`
      });
    }
    
    return { issues };
  }

  /**
   * Kiểm tra tương thích RAM
   */
  private checkRAMCompatibility(components: Component[]): { issues: CompatibilityIssue[] } {
    const issues: CompatibilityIssue[] = [];
    const motherboard = components.find(c => c.category === 'Motherboard');
    const ramSticks = components.filter(c => c.category === 'RAM');
    
    if (!motherboard || ramSticks.length === 0) return { issues };
    
    // Kiểm tra DDR type compatibility
    const incompatibleRAM = ramSticks.find(ram => 
      ram.specifications.type !== motherboard.specifications.ramType
    );
    
    if (incompatibleRAM) {
      issues.push({
        type: 'critical',
        component1: incompatibleRAM.name,
        component2: motherboard.name,
        message: `Loại RAM không tương thích: ${incompatibleRAM.specifications.type} vs ${motherboard.specifications.ramType}`,
        solution: `Chọn RAM ${motherboard.specifications.ramType}`
      });
    }
    
    // Kiểm tra số lượng slot
    if (ramSticks.length > (motherboard.specifications.ramSlots || 4)) {
      issues.push({
        type: 'critical',
        component1: 'RAM',
        component2: motherboard.name,
        message: `Quá nhiều thanh RAM: ${ramSticks.length} thanh, motherboard chỉ có ${motherboard.specifications.ramSlots} slot`,
        solution: 'Giảm số lượng thanh RAM hoặc chọn motherboard có nhiều slot hơn'
      });
    }
    
    return { issues };
  }

  /**
   * Kiểm tra PSU requirements
   */
  private checkPSUCompatibility(components: Component[]): { issues: CompatibilityIssue[] } {
    const issues: CompatibilityIssue[] = [];
    const psu = components.find(c => c.category === 'PSU');
    
    if (!psu) return { issues };
    
    // Tính tổng công suất cần thiết
    const totalPowerRequired = this.calculateTotalPowerRequirement(components);
    const psuWattage = psu.specifications.wattage || 0;
    
    // Khuyến nghị PSU có công suất 20% cao hơn yêu cầu
    const recommendedWattage = totalPowerRequired * 1.2;
    
    if (psuWattage < totalPowerRequired) {
      issues.push({
        type: 'critical',
        component1: psu.name,
        component2: 'System',
        message: `PSU không đủ công suất: ${psuWattage}W < ${totalPowerRequired}W yêu cầu`,
        solution: `Chọn PSU ít nhất ${Math.ceil(recommendedWattage)}W`
      });
    }
    
    return { issues };
  }

  /**
   * Kiểm tra physical compatibility (kích thước, clearance)
   */
  private checkPhysicalCompatibility(components: Component[]): { issues: CompatibilityIssue[] } {
    const issues: CompatibilityIssue[] = [];
    const gpu = components.find(c => c.category === 'GPU');
    const case_ = components.find(c => c.category === 'Case');
    
    // Kiểm tra GPU clearance (simplified - trong thực tế cần data chi tiết hơn)
    if (gpu && gpu.specifications.length && gpu.specifications.length > 350) {
      issues.push({
        type: 'warning',
        component1: gpu.name,
        component2: 'Case',
        message: `GPU dài ${gpu.specifications.length}mm, cần kiểm tra clearance trong case`,
        solution: 'Đảm bảo case có đủ không gian cho GPU'
      });
    }
    
    return { issues };
  }

  /**
   * Phân tích bottlenecks
   */
  private analyzeBottlenecks(components: Component[]): { warnings: CompatibilityWarning[] } {
    const warnings: CompatibilityWarning[] = [];
    const cpu = components.find(c => c.category === 'CPU');
    const gpu = components.find(c => c.category === 'GPU');
    
    // Simplified bottleneck analysis
    if (cpu && gpu) {
      // Ví dụ: CPU entry-level với GPU high-end
      if (cpu.price < 3000000 && gpu.price > 20000000) {
        warnings.push({
          type: 'bottleneck',
          message: 'CPU có thể bottleneck GPU trong gaming ở độ phân giải thấp',
          impact: 'medium'
        });
      }
    }
    
    return { warnings };
  }

  /**
   * Tạo recommendations
   */
  private generateRecommendations(
    components: Component[], 
    issues: CompatibilityIssue[], 
    warnings: CompatibilityWarning[]
  ): string[] {
    const recommendations: string[] = [];
    
    if (issues.length === 0 && warnings.length === 0) {
      recommendations.push('✅ Build tương thích hoàn hảo!');
    }
    
    if (warnings.some(w => w.type === 'bottleneck')) {
      recommendations.push('💡 Cân nhắc nâng cấp CPU để tối ưu hiệu suất');
    }
    
    return recommendations;
  }

  /**
   * Tính performance score
   */
  private calculatePerformanceScore(
    components: Component[], 
    issues: CompatibilityIssue[], 
    warnings: CompatibilityWarning[]
  ): number {
    let score = 100;
    
    // Trừ điểm cho issues
    score -= issues.filter(i => i.type === 'critical').length * 30;
    score -= issues.filter(i => i.type === 'warning').length * 15;
    
    // Trừ điểm cho warnings
    score -= warnings.filter(w => w.impact === 'high').length * 20;
    score -= warnings.filter(w => w.impact === 'medium').length * 10;
    score -= warnings.filter(w => w.impact === 'low').length * 5;
    
    return Math.max(0, score);
  }

  /**
   * Tính tổng công suất yêu cầu
   */
  private calculateTotalPowerRequirement(components: Component[]): number {
    let totalPower = 0;
    
    // Base system power
    totalPower += 100; // Motherboard, RAM, storage, fans
    
    // CPU power
    const cpu = components.find(c => c.category === 'CPU');
    if (cpu?.specifications.tdp) {
      totalPower += cpu.specifications.tdp;
    }
    
    // GPU power
    const gpu = components.find(c => c.category === 'GPU');
    if (gpu?.specifications.powerRequirement) {
      totalPower += gpu.specifications.powerRequirement;
    }
    
    return totalPower;
  }
}

// Vietnamese Hardware Database - Sample data
export const VIETNAMESE_HARDWARE_DB: Component[] = [
  {
    id: 'cpu-i7-13700k',
    name: 'Intel Core i7-13700K',
    category: 'CPU',
    price: 8500000,
    stock: 15,
    specifications: {
      socket: 'LGA1700',
      cores: 16,
      threads: 24,
      tdp: 125
    }
  },
  {
    id: 'cpu-r7-7700x',
    name: 'AMD Ryzen 7 7700X',
    category: 'CPU',
    price: 7800000,
    stock: 12,
    specifications: {
      socket: 'AM5',
      cores: 8,
      threads: 16,
      tdp: 105
    }
  },
  {
    id: 'mb-z790-asus',
    name: 'ASUS ROG STRIX Z790-E',
    category: 'Motherboard',
    price: 6800000,
    stock: 8,
    specifications: {
      socket: 'LGA1700',
      chipset: 'Z790',
      ramSlots: 4,
      maxRamCapacity: 128,
      ramType: 'DDR5',
      pciSlots: 3,
      m2Slots: 4
    }
  },
  {
    id: 'gpu-rtx4080',
    name: 'NVIDIA GeForce RTX 4080',
    category: 'GPU',
    price: 25000000,
    stock: 6,
    specifications: {
      vramSize: 16,
      powerRequirement: 320,
      length: 336,
      slots: 3
    }
  }
];
