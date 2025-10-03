/**
 * Sistema de Emissão de Documentos Fiscais
 * Gerencia NF-e, NFS-e, boletos e integração com órgãos fiscais
 */
class FiscalDocumentsSystem {
    constructor() {
        this.documents = this.loadDocuments();
        this.templates = this.loadTemplates();
        this.settings = this.loadSettings();
        this.initDemoData();
    }

    initDemoData() {
        // Templates de exemplo
        if (this.templates.length === 0) {
            this.addTemplate('nfe', 'NF-e Padrão', {
                tipo: 'nfe',
                campos: {
                    numero: { obrigatorio: true, tipo: 'numero' },
                    serie: { obrigatorio: true, tipo: 'numero' },
                    dataEmissao: { obrigatorio: true, tipo: 'data' },
                    destinatario: { obrigatorio: true, tipo: 'texto' },
                    cnpj: { obrigatorio: true, tipo: 'cnpj' },
                    endereco: { obrigatorio: true, tipo: 'texto' },
                    cidade: { obrigatorio: true, tipo: 'texto' },
                    uf: { obrigatorio: true, tipo: 'uf' },
                    valorTotal: { obrigatorio: true, tipo: 'moeda' },
                    cfop: { obrigatorio: true, tipo: 'numero' },
                    ncm: { obrigatorio: true, tipo: 'numero' },
                    unidade: { obrigatorio: true, tipo: 'texto' },
                    quantidade: { obrigatorio: true, tipo: 'numero' },
                    valorUnitario: { obrigatorio: true, tipo: 'moeda' },
                    valorProduto: { obrigatorio: true, tipo: 'moeda' },
                    icms: { obrigatorio: true, tipo: 'moeda' },
                    ipi: { obrigatorio: false, tipo: 'moeda' },
                    pis: { obrigatorio: false, tipo: 'moeda' },
                    cofins: { obrigatorio: false, tipo: 'moeda' },
                    observacoes: { obrigatorio: false, tipo: 'texto' }
                },
                layout: 'nfe-padrao'
            });

            this.addTemplate('nfse', 'NFS-e Padrão', {
                tipo: 'nfse',
                campos: {
                    numero: { obrigatorio: true, tipo: 'numero' },
                    serie: { obrigatorio: true, tipo: 'numero' },
                    dataEmissao: { obrigatorio: true, tipo: 'data' },
                    tomador: { obrigatorio: true, tipo: 'texto' },
                    cnpj: { obrigatorio: true, tipo: 'cnpj' },
                    endereco: { obrigatorio: true, tipo: 'texto' },
                    cidade: { obrigatorio: true, tipo: 'texto' },
                    uf: { obrigatorio: true, tipo: 'uf' },
                    valorTotal: { obrigatorio: true, tipo: 'moeda' },
                    codigoServico: { obrigatorio: true, tipo: 'numero' },
                    descricaoServico: { obrigatorio: true, tipo: 'texto' },
                    aliquotaIss: { obrigatorio: true, tipo: 'percentual' },
                    valorIss: { obrigatorio: true, tipo: 'moeda' },
                    observacoes: { obrigatorio: false, tipo: 'texto' }
                },
                layout: 'nfse-padrao'
            });

            this.addTemplate('boleto', 'Boleto Bancário', {
                tipo: 'boleto',
                campos: {
                    numero: { obrigatorio: true, tipo: 'numero' },
                    nossoNumero: { obrigatorio: true, tipo: 'numero' },
                    dataVencimento: { obrigatorio: true, tipo: 'data' },
                    dataEmissao: { obrigatorio: true, tipo: 'data' },
                    sacado: { obrigatorio: true, tipo: 'texto' },
                    cpfCnpj: { obrigatorio: true, tipo: 'cpfcnpj' },
                    endereco: { obrigatorio: true, tipo: 'texto' },
                    cidade: { obrigatorio: true, tipo: 'texto' },
                    uf: { obrigatorio: true, tipo: 'uf' },
                    cep: { obrigatorio: true, tipo: 'cep' },
                    valor: { obrigatorio: true, tipo: 'moeda' },
                    juros: { obrigatorio: false, tipo: 'moeda' },
                    multa: { obrigatorio: false, tipo: 'moeda' },
                    desconto: { obrigatorio: false, tipo: 'moeda' },
                    instrucoes: { obrigatorio: false, tipo: 'texto' }
                },
                layout: 'boleto-padrao'
            });

            this.saveTemplates();
        }

        // Configurações de exemplo
        if (!this.settings.empresa) {
            this.settings = {
                empresa: {
                    razaoSocial: 'Empresa Exemplo Ltda',
                    nomeFantasia: 'Empresa Exemplo',
                    cnpj: '12.345.678/0001-90',
                    inscricaoEstadual: '123456789',
                    endereco: 'Rua Exemplo, 123',
                    bairro: 'Centro',
                    cidade: 'São Paulo',
                    uf: 'SP',
                    cep: '01234-567',
                    telefone: '(11) 99999-9999',
                    email: 'contato@empresaexemplo.com.br'
                },
                certificado: {
                    numero: '',
                    validade: '',
                    senha: ''
                },
                sefaz: {
                    ambiente: 'homologacao', // homologacao ou producao
                    csc: '', // Código de Segurança do Contribuinte
                    cscId: ''
                },
                banco: {
                    codigo: '001',
                    nome: 'Banco do Brasil',
                    agencia: '1234',
                    conta: '12345-6',
                    carteira: '17'
                }
            };
            this.saveSettings();
        }
    }

    loadDocuments() {
        const documents = localStorage.getItem('fiscal_documents');
        return documents ? JSON.parse(documents) : [];
    }

    saveDocuments() {
        localStorage.setItem('fiscal_documents', JSON.stringify(this.documents));
    }

    loadTemplates() {
        const templates = localStorage.getItem('fiscal_templates');
        return templates ? JSON.parse(templates) : [];
    }

    saveTemplates() {
        localStorage.setItem('fiscal_templates', JSON.stringify(this.templates));
    }

    loadSettings() {
        const settings = localStorage.getItem('fiscal_settings');
        return settings ? JSON.parse(settings) : {};
    }

    saveSettings() {
        localStorage.setItem('fiscal_settings', JSON.stringify(this.settings));
    }

    /**
     * Adiciona um novo documento fiscal
     * @param {string} tipo - Tipo do documento (nfe, nfse, boleto)
     * @param {object} dados - Dados do documento
     * @param {string} templateId - ID do template a ser usado
     * @returns {object} O documento criado
     */
    addDocument(tipo, dados, templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) {
            throw new Error('Template não encontrado');
        }

        // Valida campos obrigatórios
        this.validateRequiredFields(dados, template.campos);

        const newDocument = {
            id: this.documents.length > 0 ? Math.max(...this.documents.map(d => d.id)) + 1 : 1,
            tipo,
            templateId,
            numero: dados.numero,
            serie: dados.serie || '001',
            dataEmissao: dados.dataEmissao || new Date().toISOString().split('T')[0],
            dataVencimento: dados.dataVencimento || null,
            status: 'rascunho', // rascunho, validado, enviado, autorizado, cancelado, rejeitado
            dados: { ...dados },
            xml: null,
            pdf: null,
            chaveAcesso: null,
            protocolo: null,
            observacoes: dados.observacoes || '',
            criadoEm: new Date().toISOString(),
            atualizadoEm: new Date().toISOString(),
            enviadoEm: null,
            autorizadoEm: null
        };

        this.documents.push(newDocument);
        this.saveDocuments();
        return newDocument;
    }

    /**
     * Valida campos obrigatórios
     * @param {object} dados - Dados a serem validados
     * @param {object} campos - Definição dos campos
     */
    validateRequiredFields(dados, campos) {
        const errors = [];
        
        for (const [campo, config] of Object.entries(campos)) {
            if (config.obrigatorio && (!dados[campo] || dados[campo].toString().trim() === '')) {
                errors.push(`Campo ${campo} é obrigatório`);
            }
        }

        if (errors.length > 0) {
            throw new Error(`Erros de validação: ${errors.join(', ')}`);
        }
    }

    /**
     * Atualiza um documento existente
     * @param {number} id - ID do documento
     * @param {object} updates - Atualizações
     * @returns {object} O documento atualizado
     */
    updateDocument(id, updates) {
        const docIndex = this.documents.findIndex(d => d.id === id);
        if (docIndex === -1) {
            throw new Error('Documento não encontrado');
        }

        const document = this.documents[docIndex];
        const template = this.templates.find(t => t.id === document.templateId);

        // Valida campos obrigatórios se houver mudanças
        if (updates.dados && template) {
            const dadosCompletos = { ...document.dados, ...updates.dados };
            this.validateRequiredFields(dadosCompletos, template.campos);
        }

        this.documents[docIndex] = {
            ...document,
            ...updates,
            dados: updates.dados ? { ...document.dados, ...updates.dados } : document.dados,
            atualizadoEm: new Date().toISOString()
        };

        this.saveDocuments();
        return this.documents[docIndex];
    }

    /**
     * Remove um documento
     * @param {number} id - ID do documento
     */
    deleteDocument(id) {
        const initialLength = this.documents.length;
        this.documents = this.documents.filter(d => d.id !== id);
        if (this.documents.length === initialLength) {
            throw new Error('Documento não encontrado');
        }
        this.saveDocuments();
    }

    /**
     * Obtém todos os documentos
     * @param {object} filters - Filtros opcionais
     * @returns {Array} Lista de documentos
     */
    getDocuments(filters = {}) {
        let filtered = [...this.documents];

        if (filters.tipo) {
            filtered = filtered.filter(d => d.tipo === filters.tipo);
        }

        if (filters.status) {
            filtered = filtered.filter(d => d.status === filters.status);
        }

        if (filters.dataInicio) {
            filtered = filtered.filter(d => d.dataEmissao >= filters.dataInicio);
        }

        if (filters.dataFim) {
            filtered = filtered.filter(d => d.dataEmissao <= filters.dataFim);
        }

        if (filters.numero) {
            filtered = filtered.filter(d => 
                d.numero.toString().includes(filters.numero.toString())
            );
        }

        return filtered.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
    }

    /**
     * Obtém um documento por ID
     * @param {number} id - ID do documento
     * @returns {object|null} O documento ou null
     */
    getDocumentById(id) {
        return this.documents.find(d => d.id === id) || null;
    }

    /**
     * Adiciona um template
     * @param {string} tipo - Tipo do template
     * @param {string} nome - Nome do template
     * @param {object} config - Configuração do template
     * @returns {object} O template criado
     */
    addTemplate(tipo, nome, config) {
        const newTemplate = {
            id: this.templates.length > 0 ? Math.max(...this.templates.map(t => t.id)) + 1 : 1,
            tipo,
            nome,
            config,
            ativo: true,
            criadoEm: new Date().toISOString()
        };

        this.templates.push(newTemplate);
        this.saveTemplates();
        return newTemplate;
    }

    /**
     * Obtém templates por tipo
     * @param {string} tipo - Tipo dos templates
     * @returns {Array} Lista de templates
     */
    getTemplatesByType(tipo) {
        return this.templates.filter(t => t.tipo === tipo && t.ativo);
    }

    /**
     * Gera XML do documento (simulado)
     * @param {number} documentId - ID do documento
     * @returns {string} XML gerado
     */
    generateXML(documentId) {
        const document = this.getDocumentById(documentId);
        if (!document) {
            throw new Error('Documento não encontrado');
        }

        // Simulação de geração de XML
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<${document.tipo.toUpperCase()}>
    <numero>${document.numero}</numero>
    <serie>${document.serie}</serie>
    <dataEmissao>${document.dataEmissao}</dataEmissao>
    ${document.dataVencimento ? `<dataVencimento>${document.dataVencimento}</dataVencimento>` : ''}
    <status>${document.status}</status>
    <dados>
        ${Object.entries(document.dados).map(([key, value]) => 
            `<${key}>${value}</${key}>`
        ).join('\n        ')}
    </dados>
</${document.tipo.toUpperCase()}>`;

        // Atualiza o documento com o XML
        this.updateDocument(documentId, { xml });
        return xml;
    }

    /**
     * Gera PDF do documento (simulado)
     * @param {number} documentId - ID do documento
     * @returns {string} URL do PDF gerado
     */
    generatePDF(documentId) {
        const document = this.getDocumentById(documentId);
        if (!document) {
            throw new Error('Documento não encontrado');
        }

        // Simulação de geração de PDF
        const pdfUrl = `data:application/pdf;base64,${btoa('PDF gerado para documento ' + document.numero)}`;
        
        // Atualiza o documento com o PDF
        this.updateDocument(documentId, { pdf: pdfUrl });
        return pdfUrl;
    }

    /**
     * Envia documento para SEFAZ (simulado)
     * @param {number} documentId - ID do documento
     * @returns {object} Resultado do envio
     */
    sendToSEFAZ(documentId) {
        const document = this.getDocumentById(documentId);
        if (!document) {
            throw new Error('Documento não encontrado');
        }

        if (document.status !== 'rascunho' && document.status !== 'validado') {
            throw new Error('Documento deve estar em rascunho ou validado para envio');
        }

        // Simulação de envio para SEFAZ
        const resultado = {
            sucesso: Math.random() > 0.2, // 80% de chance de sucesso
            protocolo: Math.random() > 0.2 ? `SEFAZ${Date.now()}` : null,
            chaveAcesso: Math.random() > 0.2 ? `NFe${Date.now()}${Math.random().toString(36).substr(2, 9)}` : null,
            mensagem: Math.random() > 0.2 ? 'Documento autorizado com sucesso' : 'Erro na autorização',
            dataEnvio: new Date().toISOString()
        };

        if (resultado.sucesso) {
            this.updateDocument(documentId, {
                status: 'autorizado',
                protocolo: resultado.protocolo,
                chaveAcesso: resultado.chaveAcesso,
                enviadoEm: resultado.dataEnvio,
                autorizadoEm: resultado.dataEnvio
            });
        } else {
            this.updateDocument(documentId, {
                status: 'rejeitado',
                enviadoEm: resultado.dataEnvio
            });
        }

        return resultado;
    }

    /**
     * Cancela um documento
     * @param {number} documentId - ID do documento
     * @param {string} motivo - Motivo do cancelamento
     * @returns {object} Resultado do cancelamento
     */
    cancelDocument(documentId, motivo) {
        const document = this.getDocumentById(documentId);
        if (!document) {
            throw new Error('Documento não encontrado');
        }

        if (document.status !== 'autorizado') {
            throw new Error('Apenas documentos autorizados podem ser cancelados');
        }

        // Simulação de cancelamento
        const resultado = {
            sucesso: Math.random() > 0.1, // 90% de chance de sucesso
            protocoloCancelamento: Math.random() > 0.1 ? `CANC${Date.now()}` : null,
            dataCancelamento: new Date().toISOString()
        };

        if (resultado.sucesso) {
            this.updateDocument(documentId, {
                status: 'cancelado',
                motivoCancelamento: motivo,
                protocoloCancelamento: resultado.protocoloCancelamento,
                canceladoEm: resultado.dataCancelamento
            });
        }

        return resultado;
    }

    /**
     * Obtém estatísticas dos documentos
     * @returns {object} Estatísticas
     */
    getStatistics() {
        const stats = {
            total: this.documents.length,
            porTipo: {},
            porStatus: {},
            valorTotal: 0,
            ultimoMes: 0,
            pendentes: 0
        };

        const dataAtual = new Date();
        const umMesAtras = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 1, dataAtual.getDate());

        this.documents.forEach(doc => {
            // Por tipo
            stats.porTipo[doc.tipo] = (stats.porTipo[doc.tipo] || 0) + 1;
            
            // Por status
            stats.porStatus[doc.status] = (stats.porStatus[doc.status] || 0) + 1;
            
            // Valor total
            if (doc.dados.valorTotal || doc.dados.valor) {
                stats.valorTotal += parseFloat(doc.dados.valorTotal || doc.dados.valor || 0);
            }
            
            // Último mês
            if (new Date(doc.criadoEm) >= umMesAtras) {
                stats.ultimoMes++;
            }
            
            // Pendentes
            if (doc.status === 'rascunho' || doc.status === 'validado') {
                stats.pendentes++;
            }
        });

        return stats;
    }

    /**
     * Atualiza configurações
     * @param {object} settings - Novas configurações
     */
    updateSettings(settings) {
        this.settings = { ...this.settings, ...settings };
        this.saveSettings();
    }

    /**
     * Obtém configurações
     * @returns {object} Configurações atuais
     */
    getSettings() {
        return this.settings;
    }

    /**
     * Exporta documentos para CSV
     * @param {Array} documentIds - IDs dos documentos (opcional)
     * @returns {string} CSV gerado
     */
    exportToCSV(documentIds = null) {
        const documents = documentIds ? 
            this.documents.filter(d => documentIds.includes(d.id)) : 
            this.documents;

        if (documents.length === 0) {
            return '';
        }

        const headers = ['ID', 'Tipo', 'Número', 'Série', 'Data Emissão', 'Status', 'Valor', 'Criado Em'];
        const rows = documents.map(doc => [
            doc.id,
            doc.tipo.toUpperCase(),
            doc.numero,
            doc.serie,
            doc.dataEmissao,
            doc.status,
            doc.dados.valorTotal || doc.dados.valor || 0,
            doc.criadoEm
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
}

// Instância global do sistema
const fiscalDocuments = new FiscalDocumentsSystem();
