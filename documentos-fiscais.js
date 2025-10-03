/**
 * Sistema de Documentos Fiscais - Interface
 * Gerencia a interface da página de documentos fiscais
 */
class DocumentosFiscaisInterface {
    constructor() {
        this.documentoAtual = null;
        this.templates = [];
        this.init();
    }

    init() {
        this.carregarEstatisticas();
        this.carregarDocumentos();
        this.configurarEventos();
        this.carregarConfiguracoes();
    }

    configurarEventos() {
        // Formulário novo documento
        document.getElementById('formNovoDocumento').addEventListener('submit', (e) => {
            e.preventDefault();
            this.salvarNovoDocumento();
        });

        // Formulário editar documento
        document.getElementById('formEditarDocumento').addEventListener('submit', (e) => {
            e.preventDefault();
            this.salvarEdicaoDocumento();
        });

        // Filtros
        document.getElementById('filtroTipo').addEventListener('change', () => {
            this.aplicarFiltros();
        });

        document.getElementById('filtroStatus').addEventListener('change', () => {
            this.aplicarFiltros();
        });

        document.getElementById('filtroDataInicio').addEventListener('change', () => {
            this.aplicarFiltros();
        });

        document.getElementById('filtroDataFim').addEventListener('change', () => {
            this.aplicarFiltros();
        });

        document.getElementById('filtroNumero').addEventListener('input', () => {
            this.aplicarFiltros();
        });
    }

    carregarEstatisticas() {
        try {
            const stats = fiscalDocuments.getStatistics();
            
            document.getElementById('totalDocumentos').textContent = stats.total;
            document.getElementById('documentosAutorizados').textContent = stats.porStatus.autorizado || 0;
            document.getElementById('documentosPendentes').textContent = stats.pendentes;
            document.getElementById('valorTotal').textContent = this.formatarMoeda(stats.valorTotal);
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
            notifications.show('Erro ao carregar estatísticas', 'error');
        }
    }

    carregarDocumentos() {
        try {
            const documentos = fiscalDocuments.getDocuments();
            this.exibirDocumentos(documentos);
        } catch (error) {
            console.error('Erro ao carregar documentos:', error);
            notifications.show('Erro ao carregar documentos', 'error');
        }
    }

    exibirDocumentos(documentos) {
        const tbody = document.getElementById('tabelaDocumentosBody');
        tbody.innerHTML = '';

        if (documentos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        <i class="fas fa-inbox"></i> Nenhum documento encontrado
                    </td>
                </tr>
            `;
            return;
        }

        documentos.forEach(doc => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <span class="badge badge-${this.getTipoBadgeClass(doc.tipo)}">
                        ${doc.tipo.toUpperCase()}
                    </span>
                </td>
                <td>${doc.numero}</td>
                <td>${doc.serie}</td>
                <td>${this.formatarData(doc.dataEmissao)}</td>
                <td>${doc.dados.destinatario || doc.dados.tomador || doc.dados.sacado || '-'}</td>
                <td>${this.formatarMoeda(doc.dados.valorTotal || doc.dados.valor || 0)}</td>
                <td>
                    <span class="badge badge-${this.getStatusBadgeClass(doc.status)}">
                        ${this.getStatusTexto(doc.status)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-info" onclick="visualizarDocumento(${doc.id})" title="Visualizar">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="editarDocumento(${doc.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${this.getBotoesAcao(doc)}
                        <button class="btn btn-sm btn-danger" onclick="excluirDocumento(${doc.id})" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    getBotoesAcao(doc) {
        let botoes = '';

        if (doc.status === 'rascunho' || doc.status === 'validado') {
            botoes += `
                <button class="btn btn-sm btn-success" onclick="enviarParaSefaz(${doc.id})" title="Enviar para SEFAZ">
                    <i class="fas fa-paper-plane"></i>
                </button>
            `;
        }

        if (doc.status === 'autorizado') {
            botoes += `
                <button class="btn btn-sm btn-warning" onclick="cancelarDocumento(${doc.id})" title="Cancelar">
                    <i class="fas fa-ban"></i>
                </button>
            `;
        }

        if (doc.xml) {
            botoes += `
                <button class="btn btn-sm btn-secondary" onclick="baixarXML(${doc.id})" title="Baixar XML">
                    <i class="fas fa-code"></i>
                </button>
            `;
        }

        if (doc.pdf) {
            botoes += `
                <button class="btn btn-sm btn-secondary" onclick="baixarPDF(${doc.id})" title="Baixar PDF">
                    <i class="fas fa-file-pdf"></i>
                </button>
            `;
        }

        return botoes;
    }

    getTipoBadgeClass(tipo) {
        const classes = {
            'nfe': 'primary',
            'nfse': 'info',
            'boleto': 'success'
        };
        return classes[tipo] || 'secondary';
    }

    getStatusBadgeClass(status) {
        const classes = {
            'rascunho': 'secondary',
            'validado': 'warning',
            'enviado': 'info',
            'autorizado': 'success',
            'cancelado': 'danger',
            'rejeitado': 'danger'
        };
        return classes[status] || 'secondary';
    }

    getStatusTexto(status) {
        const textos = {
            'rascunho': 'Rascunho',
            'validado': 'Validado',
            'enviado': 'Enviado',
            'autorizado': 'Autorizado',
            'cancelado': 'Cancelado',
            'rejeitado': 'Rejeitado'
        };
        return textos[status] || status;
    }

    aplicarFiltros() {
        const filtros = {
            tipo: document.getElementById('filtroTipo').value || undefined,
            status: document.getElementById('filtroStatus').value || undefined,
            dataInicio: document.getElementById('filtroDataInicio').value || undefined,
            dataFim: document.getElementById('filtroDataFim').value || undefined,
            numero: document.getElementById('filtroNumero').value || undefined
        };

        try {
            const documentos = fiscalDocuments.getDocuments(filtros);
            this.exibirDocumentos(documentos);
        } catch (error) {
            console.error('Erro ao aplicar filtros:', error);
            notifications.show('Erro ao aplicar filtros', 'error');
        }
    }

    abrirModalNovoDocumento() {
        document.getElementById('modalNovoDocumento').style.display = 'block';
        document.getElementById('formNovoDocumento').reset();
        document.getElementById('camposDocumento').innerHTML = '';
    }

    carregarTemplate() {
        const tipo = document.getElementById('tipoDocumento').value;
        if (!tipo) return;

        try {
            const templates = fiscalDocuments.getTemplatesByType(tipo);
            const select = document.getElementById('templateDocumento');
            
            select.innerHTML = '<option value="">Selecione um template</option>';
            templates.forEach(template => {
                const option = document.createElement('option');
                option.value = template.id;
                option.textContent = template.nome;
                select.appendChild(option);
            });

            // Carrega campos do primeiro template
            if (templates.length > 0) {
                this.carregarCamposTemplate(templates[0]);
            }
        } catch (error) {
            console.error('Erro ao carregar templates:', error);
            notifications.show('Erro ao carregar templates', 'error');
        }
    }

    carregarCamposTemplate(template) {
        const container = document.getElementById('camposDocumento');
        container.innerHTML = '';

        Object.entries(template.config.campos).forEach(([campo, config]) => {
            const div = document.createElement('div');
            div.className = 'form-group';

            const label = document.createElement('label');
            label.textContent = this.getCampoLabel(campo);
            label.setAttribute('for', campo);
            if (config.obrigatorio) {
                label.innerHTML += ' <span class="required">*</span>';
            }

            const input = this.criarInput(campo, config);

            div.appendChild(label);
            div.appendChild(input);
            container.appendChild(div);
        });
    }

    getCampoLabel(campo) {
        const labels = {
            'numero': 'Número',
            'serie': 'Série',
            'dataEmissao': 'Data de Emissão',
            'dataVencimento': 'Data de Vencimento',
            'destinatario': 'Destinatário',
            'tomador': 'Tomador do Serviço',
            'sacado': 'Sacado',
            'cnpj': 'CNPJ',
            'cpfCnpj': 'CPF/CNPJ',
            'endereco': 'Endereço',
            'cidade': 'Cidade',
            'uf': 'UF',
            'cep': 'CEP',
            'valorTotal': 'Valor Total',
            'valor': 'Valor',
            'cfop': 'CFOP',
            'ncm': 'NCM',
            'unidade': 'Unidade',
            'quantidade': 'Quantidade',
            'valorUnitario': 'Valor Unitário',
            'valorProduto': 'Valor do Produto',
            'icms': 'ICMS',
            'ipi': 'IPI',
            'pis': 'PIS',
            'cofins': 'COFINS',
            'codigoServico': 'Código do Serviço',
            'descricaoServico': 'Descrição do Serviço',
            'aliquotaIss': 'Alíquota do ISS',
            'valorIss': 'Valor do ISS',
            'nossoNumero': 'Nosso Número',
            'juros': 'Juros',
            'multa': 'Multa',
            'desconto': 'Desconto',
            'instrucoes': 'Instruções',
            'observacoes': 'Observações'
        };
        return labels[campo] || campo;
    }

    criarInput(campo, config) {
        let input;

        switch (config.tipo) {
            case 'data':
                input = document.createElement('input');
                input.type = 'date';
                break;
            case 'moeda':
                input = document.createElement('input');
                input.type = 'number';
                input.step = '0.01';
                input.min = '0';
                break;
            case 'percentual':
                input = document.createElement('input');
                input.type = 'number';
                input.step = '0.01';
                input.min = '0';
                input.max = '100';
                break;
            case 'numero':
                input = document.createElement('input');
                input.type = 'number';
                break;
            case 'uf':
                input = document.createElement('select');
                const ufs = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
                ufs.forEach(uf => {
                    const option = document.createElement('option');
                    option.value = uf;
                    option.textContent = uf;
                    input.appendChild(option);
                });
                break;
            case 'texto':
            default:
                if (campo === 'observacoes' || campo === 'instrucoes') {
                    input = document.createElement('textarea');
                    input.rows = 3;
                } else {
                    input = document.createElement('input');
                    input.type = 'text';
                }
                break;
        }

        input.id = campo;
        input.name = campo;
        input.required = config.obrigatorio;

        // Valores padrão
        if (campo === 'dataEmissao') {
            input.value = new Date().toISOString().split('T')[0];
        }
        if (campo === 'serie') {
            input.value = '001';
        }

        return input;
    }

    salvarNovoDocumento() {
        try {
            const tipo = document.getElementById('tipoDocumento').value;
            const templateId = parseInt(document.getElementById('templateDocumento').value);
            
            if (!tipo || !templateId) {
                notifications.show('Selecione o tipo e template do documento', 'error');
                return;
            }

            const dados = {};
            const template = fiscalDocuments.templates.find(t => t.id === templateId);
            
            Object.keys(template.config.campos).forEach(campo => {
                const input = document.getElementById(campo);
                if (input) {
                    dados[campo] = input.value;
                }
            });

            const documento = fiscalDocuments.addDocument(tipo, dados, templateId);
            
            notifications.show('Documento criado com sucesso!', 'success');
            this.fecharModal('modalNovoDocumento');
            this.carregarDocumentos();
            this.carregarEstatisticas();
        } catch (error) {
            console.error('Erro ao salvar documento:', error);
            notifications.show('Erro ao salvar documento: ' + error.message, 'error');
        }
    }

    editarDocumento(id) {
        try {
            const documento = fiscalDocuments.getDocumentById(id);
            if (!documento) {
                notifications.show('Documento não encontrado', 'error');
                return;
            }

            this.documentoAtual = documento;
            this.abrirModalEditarDocumento();
        } catch (error) {
            console.error('Erro ao editar documento:', error);
            notifications.show('Erro ao editar documento', 'error');
        }
    }

    abrirModalEditarDocumento() {
        const documento = this.documentoAtual;
        const template = fiscalDocuments.templates.find(t => t.id === documento.templateId);
        
        document.getElementById('editarDocumentoId').value = documento.id;
        
        const container = document.getElementById('camposEditarDocumento');
        container.innerHTML = '';

        Object.entries(template.config.campos).forEach(([campo, config]) => {
            const div = document.createElement('div');
            div.className = 'form-group';

            const label = document.createElement('label');
            label.textContent = this.getCampoLabel(campo);
            label.setAttribute('for', `editar_${campo}`);
            if (config.obrigatorio) {
                label.innerHTML += ' <span class="required">*</span>';
            }

            const input = this.criarInput(`editar_${campo}`, config);
            input.value = documento.dados[campo] || '';

            div.appendChild(label);
            div.appendChild(input);
            container.appendChild(div);
        });

        document.getElementById('modalEditarDocumento').style.display = 'block';
    }

    salvarEdicaoDocumento() {
        try {
            const id = parseInt(document.getElementById('editarDocumentoId').value);
            const documento = this.documentoAtual;
            const template = fiscalDocuments.templates.find(t => t.id === documento.templateId);
            
            const dados = {};
            Object.keys(template.config.campos).forEach(campo => {
                const input = document.getElementById(`editar_${campo}`);
                if (input) {
                    dados[campo] = input.value;
                }
            });

            fiscalDocuments.updateDocument(id, { dados });
            
            notifications.show('Documento atualizado com sucesso!', 'success');
            this.fecharModal('modalEditarDocumento');
            this.carregarDocumentos();
        } catch (error) {
            console.error('Erro ao salvar edição:', error);
            notifications.show('Erro ao salvar edição: ' + error.message, 'error');
        }
    }

    excluirDocumento(id) {
        confirmation.show(
            'Excluir Documento',
            'Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.',
            () => {
                try {
                    fiscalDocuments.deleteDocument(id);
                    notifications.show('Documento excluído com sucesso!', 'success');
                    this.carregarDocumentos();
                    this.carregarEstatisticas();
                } catch (error) {
                    console.error('Erro ao excluir documento:', error);
                    notifications.show('Erro ao excluir documento', 'error');
                }
            }
        );
    }

    visualizarDocumento(id) {
        try {
            const documento = fiscalDocuments.getDocumentById(id);
            if (!documento) {
                notifications.show('Documento não encontrado', 'error');
                return;
            }

            this.abrirModalVisualizarDocumento(documento);
        } catch (error) {
            console.error('Erro ao visualizar documento:', error);
            notifications.show('Erro ao visualizar documento', 'error');
        }
    }

    abrirModalVisualizarDocumento(documento) {
        const container = document.getElementById('conteudoVisualizarDocumento');
        container.innerHTML = `
            <div class="document-view">
                <div class="document-header">
                    <h4>${documento.tipo.toUpperCase()} - Nº ${documento.numero}</h4>
                    <span class="badge badge-${this.getStatusBadgeClass(documento.status)}">
                        ${this.getStatusTexto(documento.status)}
                    </span>
                </div>
                <div class="document-info">
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Série:</label>
                            <span>${documento.serie}</span>
                        </div>
                        <div class="info-item">
                            <label>Data de Emissão:</label>
                            <span>${this.formatarData(documento.dataEmissao)}</span>
                        </div>
                        ${documento.dataVencimento ? `
                        <div class="info-item">
                            <label>Data de Vencimento:</label>
                            <span>${this.formatarData(documento.dataVencimento)}</span>
                        </div>
                        ` : ''}
                        <div class="info-item">
                            <label>Valor:</label>
                            <span>${this.formatarMoeda(documento.dados.valorTotal || documento.dados.valor || 0)}</span>
                        </div>
                        ${documento.chaveAcesso ? `
                        <div class="info-item">
                            <label>Chave de Acesso:</label>
                            <span>${documento.chaveAcesso}</span>
                        </div>
                        ` : ''}
                        ${documento.protocolo ? `
                        <div class="info-item">
                            <label>Protocolo:</label>
                            <span>${documento.protocolo}</span>
                        </div>
                        ` : ''}
                    </div>
                    <div class="document-data">
                        <h5>Dados do Documento</h5>
                        <div class="data-grid">
                            ${Object.entries(documento.dados).map(([key, value]) => `
                                <div class="data-item">
                                    <label>${this.getCampoLabel(key)}:</label>
                                    <span>${value || '-'}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ${documento.observacoes ? `
                    <div class="document-observations">
                        <h5>Observações</h5>
                        <p>${documento.observacoes}</p>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.getElementById('modalVisualizarDocumento').style.display = 'block';
    }

    enviarParaSefaz(id) {
        confirmation.show(
            'Enviar para SEFAZ',
            'Tem certeza que deseja enviar este documento para o SEFAZ?',
            () => {
                try {
                    loading.show('Enviando documento para SEFAZ...');
                    
                    setTimeout(() => {
                        const resultado = fiscalDocuments.sendToSEFAZ(id);
                        
                        loading.hide();
                        
                        if (resultado.sucesso) {
                            notifications.show('Documento enviado e autorizado com sucesso!', 'success');
                        } else {
                            notifications.show('Erro no envio: ' + resultado.mensagem, 'error');
                        }
                        
                        this.carregarDocumentos();
                        this.carregarEstatisticas();
                    }, 2000);
                } catch (error) {
                    loading.hide();
                    console.error('Erro ao enviar para SEFAZ:', error);
                    notifications.show('Erro ao enviar para SEFAZ: ' + error.message, 'error');
                }
            }
        );
    }

    cancelarDocumento(id) {
        const motivo = prompt('Digite o motivo do cancelamento:');
        if (!motivo) return;

        confirmation.show(
            'Cancelar Documento',
            `Tem certeza que deseja cancelar este documento?\n\nMotivo: ${motivo}`,
            () => {
                try {
                    loading.show('Cancelando documento...');
                    
                    setTimeout(() => {
                        const resultado = fiscalDocuments.cancelDocument(id, motivo);
                        
                        loading.hide();
                        
                        if (resultado.sucesso) {
                            notifications.show('Documento cancelado com sucesso!', 'success');
                        } else {
                            notifications.show('Erro no cancelamento', 'error');
                        }
                        
                        this.carregarDocumentos();
                        this.carregarEstatisticas();
                    }, 1500);
                } catch (error) {
                    loading.hide();
                    console.error('Erro ao cancelar documento:', error);
                    notifications.show('Erro ao cancelar documento: ' + error.message, 'error');
                }
            }
        );
    }

    baixarXML(id) {
        try {
            const documento = fiscalDocuments.getDocumentById(id);
            if (!documento || !documento.xml) {
                notifications.show('XML não disponível', 'error');
                return;
            }

            const blob = new Blob([documento.xml], { type: 'application/xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${documento.tipo}_${documento.numero}.xml`;
            a.click();
            URL.revokeObjectURL(url);
            
            notifications.show('XML baixado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao baixar XML:', error);
            notifications.show('Erro ao baixar XML', 'error');
        }
    }

    baixarPDF(id) {
        try {
            const documento = fiscalDocuments.getDocumentById(id);
            if (!documento || !documento.pdf) {
                notifications.show('PDF não disponível', 'error');
                return;
            }

            const a = document.createElement('a');
            a.href = documento.pdf;
            a.download = `${documento.tipo}_${documento.numero}.pdf`;
            a.click();
            
            notifications.show('PDF baixado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao baixar PDF:', error);
            notifications.show('Erro ao baixar PDF', 'error');
        }
    }

    exportarCSV() {
        try {
            const csv = fiscalDocuments.exportToCSV();
            if (!csv) {
                notifications.show('Nenhum documento para exportar', 'warning');
                return;
            }

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `documentos_fiscais_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            
            notifications.show('CSV exportado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao exportar CSV:', error);
            notifications.show('Erro ao exportar CSV', 'error');
        }
    }

    abrirConfiguracoes() {
        this.carregarConfiguracoes();
        document.getElementById('modalConfiguracoes').style.display = 'block';
    }

    carregarConfiguracoes() {
        try {
            const settings = fiscalDocuments.getSettings();
            
            // Dados da empresa
            if (settings.empresa) {
                Object.entries(settings.empresa).forEach(([key, value]) => {
                    const input = document.getElementById(key);
                    if (input) input.value = value || '';
                });
            }

            // Certificado
            if (settings.certificado) {
                Object.entries(settings.certificado).forEach(([key, value]) => {
                    const input = document.getElementById(`${key}Certificado`);
                    if (input) input.value = value || '';
                });
            }

            // SEFAZ
            if (settings.sefaz) {
                Object.entries(settings.sefaz).forEach(([key, value]) => {
                    const input = document.getElementById(`${key}Sefaz`);
                    if (input) input.value = value || '';
                });
            }

            // Banco
            if (settings.banco) {
                Object.entries(settings.banco).forEach(([key, value]) => {
                    const input = document.getElementById(key);
                    if (input && !document.getElementById('modalConfiguracoes').contains(input)) {
                        const bancoInput = document.getElementById(key);
                        if (bancoInput) bancoInput.value = value || '';
                    }
                });
            }
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
        }
    }

    salvarConfiguracoes() {
        try {
            const settings = {};

            // Dados da empresa
            settings.empresa = {};
            const empresaFields = ['razaoSocial', 'nomeFantasia', 'cnpj', 'inscricaoEstadual', 'endereco', 'bairro', 'cidade', 'uf', 'cep', 'telefone', 'email'];
            empresaFields.forEach(field => {
                const input = document.getElementById(field);
                if (input) settings.empresa[field] = input.value;
            });

            // Certificado
            settings.certificado = {};
            const certificadoFields = ['numero', 'validade', 'senha'];
            certificadoFields.forEach(field => {
                const input = document.getElementById(`${field}Certificado`);
                if (input) settings.certificado[field] = input.value;
            });

            // SEFAZ
            settings.sefaz = {};
            const sefazFields = ['ambiente', 'csc', 'cscId'];
            sefazFields.forEach(field => {
                const input = document.getElementById(`${field}Sefaz`);
                if (input) settings.sefaz[field] = input.value;
            });

            // Banco
            settings.banco = {};
            const bancoFields = ['codigo', 'nome', 'agencia', 'conta', 'carteira'];
            bancoFields.forEach(field => {
                const input = document.getElementById(field);
                if (input) settings.banco[field] = input.value;
            });

            fiscalDocuments.updateSettings(settings);
            
            notifications.show('Configurações salvas com sucesso!', 'success');
            this.fecharModal('modalConfiguracoes');
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            notifications.show('Erro ao salvar configurações', 'error');
        }
    }

    fecharModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    formatarData(data) {
        return new Date(data).toLocaleDateString('pt-BR');
    }

    formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    }
}

// Funções globais para os eventos
function abrirModalNovoDocumento() {
    documentosFiscaisInterface.abrirModalNovoDocumento();
}

function carregarTemplate() {
    documentosFiscaisInterface.carregarTemplate();
}

function aplicarFiltros() {
    documentosFiscaisInterface.aplicarFiltros();
}

function editarDocumento(id) {
    documentosFiscaisInterface.editarDocumento(id);
}

function excluirDocumento(id) {
    documentosFiscaisInterface.excluirDocumento(id);
}

function visualizarDocumento(id) {
    documentosFiscaisInterface.visualizarDocumento(id);
}

function enviarParaSefaz(id) {
    documentosFiscaisInterface.enviarParaSefaz(id);
}

function cancelarDocumento(id) {
    documentosFiscaisInterface.cancelarDocumento(id);
}

function baixarXML(id) {
    documentosFiscaisInterface.baixarXML(id);
}

function baixarPDF(id) {
    documentosFiscaisInterface.baixarPDF(id);
}

function exportarCSV() {
    documentosFiscaisInterface.exportarCSV();
}

function abrirConfiguracoes() {
    documentosFiscaisInterface.abrirConfiguracoes();
}

function salvarConfiguracoes() {
    documentosFiscaisInterface.salvarConfiguracoes();
}

function fecharModal(modalId) {
    documentosFiscaisInterface.fecharModal(modalId);
}

function abrirTab(tabName) {
    // Remove active de todas as tabs
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Adiciona active na tab selecionada
    document.querySelector(`[onclick="abrirTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Verifica autenticação
    if (!auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // Verifica permissão
    if (!auth.hasPermission('fiscal.*')) {
        notifications.show('Você não tem permissão para acessar esta página', 'error');
        setTimeout(() => window.location.href = 'index.html', 2000);
        return;
    }

    // Inicializa a interface
    window.documentosFiscaisInterface = new DocumentosFiscaisInterface();
});
