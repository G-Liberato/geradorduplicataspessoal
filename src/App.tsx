/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Download, 
  User, 
  Building2, 
  MapPin, 
  Calendar, 
  Hash, 
  CreditCard, 
  Briefcase,
  Printer,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface DuplicataData {
  customerName: string;
  customerTaxId: string;
  customerAddress: string;
  amount: string;
  issueDate: string;
  dueDate: string;
  invoiceNumber: string;
  description: string;
  issuerName: string;
  issuerTaxId: string;
}

export default function App() {
  const [data, setData] = useState<DuplicataData>({
    customerName: '',
    customerTaxId: '',
    customerAddress: '',
    amount: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    invoiceNumber: '',
    description: '',
    issuerName: '',
    issuerTaxId: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const duplicataRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const formatCurrency = (value: string) => {
    if (!value) return 'R$ 0,00';
    const num = parseFloat(value.replace(/[^\d]/g, '')) / 100;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    setData(prev => ({ ...prev, amount: value }));
  };

  const handlePrint = () => {
    window.print();
  };

  // Mantemos a função mas agora ela avisa para usar a impressão se falhar
  const exportPDF = async () => {
    if (!duplicataRef.current) return;
    
    setIsGenerating(true);
    setErrorMessage(null);
    
    try {
      const element = duplicataRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: false, // Desativado para evitar erros de segurança
        allowTaint: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`duplicata-${data.invoiceNumber || 'sem-numero'}.pdf`);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      // Se falhar o download direto, abrimos a impressão automaticamente
      handlePrint();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar / Form Section */}
      <div className="w-full lg:w-[450px] bg-white border-r border-slate-200 overflow-y-auto p-6 lg:h-screen no-print">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-600 rounded-xl">
            <FileText className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Gerador de Duplicatas</h1>
            <p className="text-xs text-slate-500">Preencha os dados abaixo</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Emissor Section */}
          <section>
            <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Dados do Emissor (Você)
            </h2>
            <div className="space-y-3">
              <div>
                <label className="label-text">Nome / Empresa</label>
                <input 
                  type="text" 
                  name="issuerName" 
                  value={data.issuerName} 
                  onChange={handleChange} 
                  className="input-field" 
                  placeholder="Seu nome ou Razão Social"
                />
              </div>
              <div>
                <label className="label-text">Seu CPF / CNPJ</label>
                <input 
                  type="text" 
                  name="issuerTaxId" 
                  value={data.issuerTaxId} 
                  onChange={handleChange} 
                  className="input-field" 
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>
          </section>

          {/* Cliente Section */}
          <section>
            <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Dados do Cliente
            </h2>
            <div className="space-y-3">
              <div>
                <label className="label-text">Nome / Razão Social</label>
                <input 
                  type="text" 
                  name="customerName" 
                  value={data.customerName} 
                  onChange={handleChange} 
                  className="input-field" 
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <label className="label-text">CPF / CNPJ</label>
                <input 
                  type="text" 
                  name="customerTaxId" 
                  value={data.customerTaxId} 
                  onChange={handleChange} 
                  className="input-field" 
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <label className="label-text">Endereço Completo</label>
                <input 
                  type="text" 
                  name="customerAddress" 
                  value={data.customerAddress} 
                  onChange={handleChange} 
                  className="input-field" 
                  placeholder="Rua, número, bairro, cidade - UF"
                />
              </div>
            </div>
          </section>

          {/* Cobrança Section */}
          <section>
            <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              Dados da Cobrança
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="label-text">Valor (R$)</label>
                <input 
                  type="text" 
                  name="amount" 
                  value={data.amount} 
                  onChange={handleAmountChange} 
                  className="input-field font-mono" 
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="label-text">Emissão</label>
                <input 
                  type="date" 
                  name="issueDate" 
                  value={data.issueDate} 
                  onChange={handleChange} 
                  className="input-field" 
                />
              </div>
              <div>
                <label className="label-text">Vencimento</label>
                <input 
                  type="date" 
                  name="dueDate" 
                  value={data.dueDate} 
                  onChange={handleChange} 
                  className="input-field" 
                />
              </div>
              <div className="col-span-2">
                <label className="label-text">Número da Duplicata</label>
                <input 
                  type="text" 
                  name="invoiceNumber" 
                  value={data.invoiceNumber} 
                  onChange={handleChange} 
                  className="input-field" 
                  placeholder="Ex: 001/2024"
                />
              </div>
              <div className="col-span-2">
                <label className="label-text">Descrição do Serviço/Produto</label>
                <textarea 
                  name="description" 
                  value={data.description} 
                  onChange={handleChange} 
                  className="input-field min-h-[80px] resize-none" 
                  placeholder="Descreva o que está sendo cobrado..."
                />
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-3">
            <button 
              onClick={exportPDF}
              disabled={isGenerating}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
            >
              {isGenerating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Baixar PDF
                </>
              )}
            </button>

            <button 
              onClick={handlePrint}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Printer className="w-5 h-5" />
              Imprimir / Salvar Manualmente
            </button>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="flex-1 bg-slate-100 p-4 lg:p-12 overflow-y-auto flex flex-col items-center gap-6 relative">
        {/* Quick Action Bar (Floating) */}
        <div className="sticky top-0 z-40 w-full max-w-[210mm] flex justify-end mb-2 no-print">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePrint}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-full shadow-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Gerar PDF (Imprimir)
          </motion.button>
        </div>

        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 right-6 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 z-50"
            >
              <CheckCircle2 className="w-5 h-5" />
              PDF gerado com sucesso!
            </motion.div>
          )}

          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-[210mm] bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3 no-print"
            >
              <div className="mt-0.5">⚠️</div>
              <p className="text-sm">{errorMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div 
          ref={duplicataRef}
          id="duplicata-content"
          className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-2xl p-[20mm] flex flex-col gap-8 text-slate-900"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-tighter">Duplicata Mercantil</h2>
              <p className="text-sm text-slate-500 mt-1 italic">Via Única</p>
            </div>
            <div className="text-right">
              <div className="bg-slate-900 text-white px-4 py-2 rounded">
                <p className="text-xs uppercase font-bold">Número</p>
                <p className="text-lg font-mono">{data.invoiceNumber || '---'}</p>
              </div>
            </div>
          </div>

          {/* Top Info Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-slate-200 p-3 rounded">
              <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Valor da Fatura</p>
              <p className="text-lg font-bold">{formatCurrency(data.amount)}</p>
            </div>
            <div className="border border-slate-200 p-3 rounded">
              <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Data de Emissão</p>
              <p className="text-lg font-bold">{data.issueDate ? new Date(data.issueDate).toLocaleDateString('pt-BR') : '---'}</p>
            </div>
            <div className="border border-slate-900 p-3 rounded bg-slate-50">
              <p className="text-[10px] uppercase font-bold text-slate-900 mb-1">Vencimento</p>
              <p className="text-lg font-bold text-red-600">{data.dueDate ? new Date(data.dueDate).toLocaleDateString('pt-BR') : '---'}</p>
            </div>
          </div>

          {/* Issuer & Customer */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase border-b border-slate-200 pb-1">Emissor</h3>
              <div>
                <p className="text-sm font-bold">{data.issuerName || '---'}</p>
                <p className="text-xs text-slate-600 mt-1">CPF/CNPJ: {data.issuerTaxId || '---'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase border-b border-slate-200 pb-1">Sacado (Cliente)</h3>
              <div>
                <p className="text-sm font-bold">{data.customerName || '---'}</p>
                <p className="text-xs text-slate-600 mt-1">CPF/CNPJ: {data.customerTaxId || '---'}</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{data.customerAddress || '---'}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="flex-1 border border-slate-200 rounded p-6">
            <h3 className="text-xs font-bold uppercase text-slate-500 mb-4">Descrição dos Serviços / Produtos</h3>
            <div className="text-sm leading-relaxed whitespace-pre-wrap min-h-[200px]">
              {data.description || 'Nenhuma descrição informada.'}
            </div>
          </div>

          {/* Bottom Info */}
          <div className="space-y-8">
            <div className="text-xs text-slate-500 leading-relaxed italic">
              Reconheço(emos) a exatidão desta DUPLICATA DE VENDA MERCANTIL / PRESTAÇÃO DE SERVIÇOS na importância acima mencionada, a qual pagarei(emos) à empresa emissora ou à sua ordem no vencimento indicado.
            </div>

            <div className="grid grid-cols-2 gap-12 pt-8">
              <div className="border-t border-slate-900 pt-2 text-center">
                <p className="text-[10px] uppercase font-bold">Data do Aceite</p>
              </div>
              <div className="border-t border-slate-900 pt-2 text-center">
                <p className="text-[10px] uppercase font-bold">Assinatura do Sacado</p>
              </div>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="mt-auto pt-8 border-t border-slate-100 flex justify-between items-center opacity-30 grayscale">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="text-[8px] font-bold uppercase tracking-widest">Documento Gerado Digitalmente</span>
            </div>
            <span className="text-[8px] font-mono">{new Date().toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
