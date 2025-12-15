const API_URL = 'http://localhost:3000/api';

// Variáveis globais para ordenação
let dadosLivros = [];
let dadosUsuarios = [];
let dadosEmprestimos = [];
let ordenacaoAtual = {
    livros: { campo: 'id', direcao: 'asc' },
    usuarios: { campo: 'id', direcao: 'asc' },
    emprestimos: { campo: 'id', direcao: 'asc' }
};

// Navegação entre seções
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const section = btn.dataset.section;
        mostrarSecao(section);
    });
});

function mostrarSecao(section) {
    // Atualizar botões de navegação
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const navBtn = document.querySelector(`[data-section="${section}"]`);
    if (navBtn) {
        navBtn.classList.add('active');
    }

    // Mostrar seção correspondente
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const sectionElement = document.getElementById(section);
    if (sectionElement) {
        sectionElement.classList.add('active');
    }

    // Carregar dados da seção
    if (section === 'livros') {
        carregarLivros();
    } else if (section === 'usuarios') {
        carregarUsuarios();
    } else if (section === 'emprestimos') {
        carregarEmprestimos();
    }
}

// ========== FUNÇÕES DE LIVROS ==========

async function carregarLivros() {
    try {
        const response = await fetch(`${API_URL}/livros`);
        const data = await response.json();
        
        if (!response.ok) {
            mostrarErro(data.error || 'Erro ao carregar livros');
            exibirLivros([]);
            return;
        }
        
        // Verificar se é um array
        if (Array.isArray(data)) {
            dadosLivros = data;
            aplicarOrdenacao('livros');
            atualizarIconesOrdenacao('livros', 'id');
        } else {
            console.error('Resposta inválida:', data);
            mostrarErro('Resposta inválida recebida do servidor');
            exibirLivros([]);
        }
    } catch (error) {
        console.error('Erro ao carregar livros:', error);
        mostrarErro('Não foi possível conectar com o servidor. Verifique se o servidor está rodando.');
        exibirLivros([]);
    }
}

function exibirLivros(livros) {
    const tbody = document.getElementById('tbodyLivros');
    if (!livros || livros.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">Nenhum livro cadastrado</td></tr>';
        return;
    }

    tbody.innerHTML = livros.map(livro => `
        <tr>
            <td>${livro.id}</td>
            <td>${livro.titulo}</td>
            <td>${livro.autor}</td>
            <td>${livro.editora || '-'}</td>
            <td>${livro.ano_publicacao || '-'}</td>
            <td>${livro.quantidade_disponivel}/${livro.quantidade_total}</td>
            <td>${livro.categoria || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-edit" onclick="editarLivro(${livro.id})" title="Editar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deletarLivro(${livro.id})" title="Excluir">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function buscarLivros() {
    const termo = document.getElementById('buscaLivro').value.trim();
    
    try {
        let response;
        if (termo) {
            response = await fetch(`${API_URL}/livros/busca/${encodeURIComponent(termo)}`);
        } else {
            response = await fetch(`${API_URL}/livros`);
        }
        const livros = await response.json();
        dadosLivros = Array.isArray(livros) ? livros : [];
        aplicarOrdenacao('livros');
        atualizarIconesOrdenacao('livros', 'id');
    } catch (error) {
        console.error('Erro ao buscar livros:', error);
        mostrarErro('Não foi possível buscar os livros. Tente novamente.');
    }
}

function abrirModalLivro(id = null) {
    const modal = document.getElementById('modalLivro');
    const form = document.getElementById('formLivro');
    const titulo = document.getElementById('tituloModalLivro');
    
    form.reset();
    document.getElementById('livroId').value = '';
    
    if (id) {
        titulo.textContent = 'Editar Livro';
        carregarDadosLivro(id);
    } else {
        titulo.textContent = 'Novo Livro';
    }
    
    modal.classList.add('active');
}

async function carregarDadosLivro(id) {
    try {
        const response = await fetch(`${API_URL}/livros/${id}`);
        const livro = await response.json();
        
        document.getElementById('livroId').value = livro.id;
        document.getElementById('livroTitulo').value = livro.titulo;
        document.getElementById('livroAutor').value = livro.autor;
        document.getElementById('livroIsbn').value = livro.isbn || '';
        document.getElementById('livroEditora').value = livro.editora || '';
        document.getElementById('livroAno').value = livro.ano_publicacao || '';
        document.getElementById('livroQuantidade').value = livro.quantidade_total || 1;
        document.getElementById('livroCategoria').value = livro.categoria || '';
    } catch (error) {
        console.error('Erro ao carregar livro:', error);
        mostrarErro('Não foi possível carregar os dados do livro.');
    }
}

function fecharModalLivro() {
    document.getElementById('modalLivro').classList.remove('active');
}

async function salvarLivro(event) {
    event.preventDefault();
    
    const id = document.getElementById('livroId').value;
    const livro = {
        titulo: document.getElementById('livroTitulo').value,
        autor: document.getElementById('livroAutor').value,
        isbn: document.getElementById('livroIsbn').value,
        editora: document.getElementById('livroEditora').value,
        ano_publicacao: document.getElementById('livroAno').value || null,
        quantidade_total: parseInt(document.getElementById('livroQuantidade').value),
        categoria: document.getElementById('livroCategoria').value
    };

    try {
        const url = id ? `${API_URL}/livros/${id}` : `${API_URL}/livros`;
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(livro)
        });

        if (response.ok) {
            fecharModalLivro();
            carregarLivros();
            mostrarSucesso(id ? 'Livro atualizado com sucesso!' : 'Livro cadastrado com sucesso!');
        } else {
            const error = await response.json();
            mostrarErro(error.error || 'Erro ao salvar livro');
        }
    } catch (error) {
        console.error('Erro ao salvar livro:', error);
        mostrarErro('Não foi possível salvar o livro. Tente novamente.');
    }
}

async function editarLivro(id) {
    abrirModalLivro(id);
}

async function deletarLivro(id) {
    mostrarConfirmacao('Tem certeza que deseja excluir este livro?', async () => {
        try {
            const response = await fetch(`${API_URL}/livros/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                carregarLivros();
                mostrarSucesso('Livro excluído com sucesso!');
            } else {
                const error = await response.json();
                mostrarErro(error.error || 'Erro ao excluir livro');
            }
        } catch (error) {
            console.error('Erro ao excluir livro:', error);
            mostrarErro('Não foi possível excluir o livro. Tente novamente.');
        }
    });
}

// ========== FUNÇÕES DE USUÁRIOS ==========

async function carregarUsuarios() {
    try {
        const response = await fetch(`${API_URL}/usuarios`);
        const data = await response.json();
        
        if (!response.ok) {
            mostrarErro(data.error || 'Erro ao carregar usuários');
            exibirUsuarios([]);
            return;
        }
        
        if (Array.isArray(data)) {
            dadosUsuarios = data;
            aplicarOrdenacao('usuarios');
            atualizarIconesOrdenacao('usuarios', 'id');
        } else {
            console.error('Resposta inválida:', data);
            mostrarErro('Resposta inválida recebida do servidor');
            exibirUsuarios([]);
        }
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        mostrarErro('Não foi possível conectar com o servidor. Verifique se o servidor está rodando.');
        exibirUsuarios([]);
    }
}

function exibirUsuarios(usuarios) {
    const tbody = document.getElementById('tbodyUsuarios');
    if (!usuarios || usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Nenhum usuário cadastrado</td></tr>';
        return;
    }

    tbody.innerHTML = usuarios.map(usuario => `
        <tr>
            <td>${usuario.id}</td>
            <td>${usuario.nome}</td>
            <td>${usuario.email}</td>
            <td>${usuario.telefone || '-'}</td>
            <td>${usuario.tipo}</td>
            <td>${usuario.matricula || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-edit" onclick="editarUsuario(${usuario.id})" title="Editar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deletarUsuario(${usuario.id})" title="Excluir">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function abrirModalUsuario(id = null) {
    const modal = document.getElementById('modalUsuario');
    const form = document.getElementById('formUsuario');
    const titulo = document.getElementById('tituloModalUsuario');
    
    form.reset();
    document.getElementById('usuarioId').value = '';
    
    if (id) {
        titulo.textContent = 'Editar Usuário';
        carregarDadosUsuario(id);
    } else {
        titulo.textContent = 'Novo Usuário';
    }
    
    modal.classList.add('active');
}

async function carregarDadosUsuario(id) {
    try {
        const response = await fetch(`${API_URL}/usuarios/${id}`);
        const usuario = await response.json();
        
        document.getElementById('usuarioId').value = usuario.id;
        document.getElementById('usuarioNome').value = usuario.nome;
        document.getElementById('usuarioEmail').value = usuario.email;
        document.getElementById('usuarioTelefone').value = usuario.telefone || '';
        document.getElementById('usuarioTipo').value = usuario.tipo;
        document.getElementById('usuarioMatricula').value = usuario.matricula || '';
    } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        mostrarErro('Não foi possível carregar os dados do usuário.');
    }
}

function fecharModalUsuario() {
    document.getElementById('modalUsuario').classList.remove('active');
}

async function salvarUsuario(event) {
    event.preventDefault();
    
    const id = document.getElementById('usuarioId').value;
    const usuario = {
        nome: document.getElementById('usuarioNome').value,
        email: document.getElementById('usuarioEmail').value,
        telefone: document.getElementById('usuarioTelefone').value,
        tipo: document.getElementById('usuarioTipo').value,
        matricula: document.getElementById('usuarioMatricula').value
    };

    try {
        const url = id ? `${API_URL}/usuarios/${id}` : `${API_URL}/usuarios`;
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usuario)
        });

        if (response.ok) {
            fecharModalUsuario();
            carregarUsuarios();
            mostrarSucesso(id ? 'Usuário atualizado com sucesso!' : 'Usuário cadastrado com sucesso!');
        } else {
            const error = await response.json();
            mostrarErro(error.error || 'Erro ao salvar usuário');
        }
    } catch (error) {
        console.error('Erro ao salvar usuário:', error);
        mostrarErro('Não foi possível salvar o usuário. Tente novamente.');
    }
}

async function editarUsuario(id) {
    abrirModalUsuario(id);
}

async function deletarUsuario(id) {
    mostrarConfirmacao('Tem certeza que deseja excluir este usuário?', async () => {
        try {
            const response = await fetch(`${API_URL}/usuarios/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                carregarUsuarios();
                mostrarSucesso('Usuário excluído com sucesso!');
            } else {
                const error = await response.json();
                mostrarErro(error.error || 'Erro ao excluir usuário');
            }
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            mostrarErro('Não foi possível excluir o usuário. Tente novamente.');
        }
    });
}

// ========== FUNÇÕES DE EMPRÉSTIMOS ==========

async function carregarEmprestimos() {
    try {
        const response = await fetch(`${API_URL}/emprestimos`);
        const data = await response.json();
        
        if (!response.ok) {
            mostrarErro(data.error || 'Erro ao carregar empréstimos');
            exibirEmprestimos([]);
            return;
        }
        
        if (Array.isArray(data)) {
            dadosEmprestimos = data;
            aplicarOrdenacao('emprestimos');
            atualizarIconesOrdenacao('emprestimos', 'id');
        } else {
            console.error('Resposta inválida:', data);
            mostrarErro('Resposta inválida recebida do servidor');
            exibirEmprestimos([]);
        }
    } catch (error) {
        console.error('Erro ao carregar empréstimos:', error);
        mostrarErro('Não foi possível conectar com o servidor. Verifique se o servidor está rodando.');
        exibirEmprestimos([]);
    }
}

function exibirEmprestimos(emprestimos) {
    const tbody = document.getElementById('tbodyEmprestimos');
    if (!emprestimos || emprestimos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">Nenhum empréstimo registrado</td></tr>';
        return;
    }

    tbody.innerHTML = emprestimos.map(emp => {
        const statusClass = `status-${emp.status}`;
        const multa = emp.multa > 0 ? `R$ ${parseFloat(emp.multa).toFixed(2)}` : '-';
        const dataDevolucao = emp.data_devolucao_real 
            ? new Date(emp.data_devolucao_real).toLocaleDateString('pt-BR')
            : '-';
        
        return `
            <tr>
                <td>${emp.id}</td>
                <td>${emp.livro_titulo}</td>
                <td>${emp.usuario_nome}</td>
                <td>${new Date(emp.data_emprestimo).toLocaleDateString('pt-BR')}</td>
                <td>${dataDevolucao}</td>
                <td><span class="status-badge ${statusClass}">${emp.status}</span></td>
                <td>${multa}</td>
                <td>
                    <div class="action-buttons">
                        ${emp.status === 'ativo' || emp.status === 'atrasado' 
                            ? `<button class="btn-icon btn-edit" onclick="editarEmprestimo(${emp.id})" title="Editar">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <button class="btn-icon btn-success" onclick="devolverLivro(${emp.id})" title="Devolver">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </button>
                            <button class="btn-icon btn-delete" onclick="cancelarEmprestimo(${emp.id})" title="Cancelar Empréstimo">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>`
                            : emp.status === 'devolvido'
                            ? `<button class="btn-icon btn-edit" onclick="editarEmprestimo(${emp.id})" title="Editar">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <button class="btn-icon btn-warning" onclick="reverterDevolucao(${emp.id})" title="Reverter Devolução">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="1 4 1 10 7 10"></polyline>
                                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                                </svg>
                            </button>`
                            : '-'
                        }
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function abrirModalEmprestimo(id = null) {
    const modal = document.getElementById('modalEmprestimo');
    const form = document.getElementById('formEmprestimo');
    const titulo = document.getElementById('tituloModalEmprestimo');
    const grupoDias = document.getElementById('grupoDiasEmprestimo');
    const btnSalvar = document.getElementById('btnSalvarEmprestimo');
    
    form.reset();
    document.getElementById('emprestimoId').value = '';
    
    if (id) {
        titulo.textContent = 'Editar Empréstimo';
        grupoDias.style.display = 'none';
        btnSalvar.textContent = 'Salvar Alterações';
        carregarDadosEmprestimo(id);
    } else {
        titulo.textContent = 'Novo Empréstimo';
        grupoDias.style.display = 'block';
        btnSalvar.textContent = 'Realizar Empréstimo';
        carregarLivrosParaEmprestimo();
        carregarUsuariosParaEmprestimo();
    }
    
    modal.classList.add('active');
}

async function carregarDadosEmprestimo(id) {
    try {
        const [empResponse, livroResponse, usuarioResponse] = await Promise.all([
            fetch(`${API_URL}/emprestimos/${id}`),
            fetch(`${API_URL}/livros`),
            fetch(`${API_URL}/usuarios`)
        ]);
        
        const emp = await empResponse.json();
        const livros = await livroResponse.json();
        const usuarios = await usuarioResponse.json();
        
        document.getElementById('emprestimoId').value = emp.id;
        
        // Preencher selects
        const selectLivro = document.getElementById('emprestimoLivro');
        selectLivro.innerHTML = '<option value="">Selecione um livro...</option>';
        livros.forEach(livro => {
            const option = document.createElement('option');
            option.value = livro.id;
            option.textContent = `${livro.titulo} - ${livro.autor}`;
            if (livro.id == emp.livro_id) {
                option.selected = true;
            }
            selectLivro.appendChild(option);
        });
        
        const selectUsuario = document.getElementById('emprestimoUsuario');
        selectUsuario.innerHTML = '<option value="">Selecione um usuário...</option>';
        usuarios.forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario.id;
            option.textContent = `${usuario.nome} (${usuario.tipo})`;
            if (usuario.id == emp.usuario_id) {
                option.selected = true;
            }
            selectUsuario.appendChild(option);
        });
        
        // Preencher datas
        const dataEmp = new Date(emp.data_emprestimo);
        document.getElementById('emprestimoDataEmprestimo').value = dataEmp.toISOString().split('T')[0];
        
        const dataDevPrev = new Date(emp.data_devolucao_prevista);
        document.getElementById('emprestimoDataDevolucao').value = dataDevPrev.toISOString().split('T')[0];
        
        if (emp.data_devolucao_real) {
            const dataDevReal = new Date(emp.data_devolucao_real);
            document.getElementById('emprestimoDataDevolucaoReal').value = dataDevReal.toISOString().split('T')[0];
        }
        
        document.getElementById('emprestimoStatus').value = emp.status;
        document.getElementById('emprestimoMulta').value = emp.multa || 0;
    } catch (error) {
        console.error('Erro ao carregar empréstimo:', error);
        mostrarErro('Erro ao carregar dados do empréstimo');
    }
}

async function carregarLivrosParaEmprestimo() {
    try {
        const response = await fetch(`${API_URL}/livros`);
        const livros = await response.json();
        const select = document.getElementById('emprestimoLivro');
        
        select.innerHTML = '<option value="">Selecione um livro...</option>';
        livros.filter(l => l.quantidade_disponivel > 0).forEach(livro => {
            const option = document.createElement('option');
            option.value = livro.id;
            option.textContent = `${livro.titulo} - ${livro.autor} (${livro.quantidade_disponivel} disponível)`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar livros:', error);
    }
}

async function carregarUsuariosParaEmprestimo() {
    try {
        const response = await fetch(`${API_URL}/usuarios`);
        const usuarios = await response.json();
        const select = document.getElementById('emprestimoUsuario');
        
        select.innerHTML = '<option value="">Selecione um usuário...</option>';
        usuarios.forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario.id;
            option.textContent = `${usuario.nome} (${usuario.tipo})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
}

function fecharModalEmprestimo() {
    document.getElementById('modalEmprestimo').classList.remove('active');
}

async function salvarEmprestimo(event) {
    event.preventDefault();
    
    const id = document.getElementById('emprestimoId').value;
    const livro_id = parseInt(document.getElementById('emprestimoLivro').value);
    const usuario_id = parseInt(document.getElementById('emprestimoUsuario').value);
    
    let emprestimo;
    
    if (id) {
        // Edição
        emprestimo = {
            data_emprestimo: document.getElementById('emprestimoDataEmprestimo').value,
            data_devolucao_prevista: document.getElementById('emprestimoDataDevolucao').value,
            data_devolucao_real: document.getElementById('emprestimoDataDevolucaoReal').value || null,
            status: document.getElementById('emprestimoStatus').value,
            multa: parseFloat(document.getElementById('emprestimoMulta').value) || 0
        };
        
        try {
            const response = await fetch(`${API_URL}/emprestimos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emprestimo)
            });

            if (response.ok) {
                fecharModalEmprestimo();
                carregarEmprestimos();
                mostrarSucesso('Empréstimo atualizado com sucesso!');
            } else {
                const error = await response.json();
                mostrarErro(error.error || 'Erro ao atualizar empréstimo');
            }
        } catch (error) {
            console.error('Erro ao atualizar empréstimo:', error);
            mostrarErro('Erro ao atualizar empréstimo');
        }
    } else {
        // Novo empréstimo
        emprestimo = {
            livro_id: livro_id,
            usuario_id: usuario_id,
            dias_emprestimo: parseInt(document.getElementById('emprestimoDias').value) || 7
        };

        try {
            const response = await fetch(`${API_URL}/emprestimos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emprestimo)
            });

            if (response.ok) {
                fecharModalEmprestimo();
                carregarEmprestimos();
                mostrarSucesso('Empréstimo realizado com sucesso!');
            } else {
                const error = await response.json();
                mostrarErro(error.error || 'Erro ao realizar empréstimo');
            }
        } catch (error) {
            console.error('Erro ao realizar empréstimo:', error);
            mostrarErro('Não foi possível realizar o empréstimo. Tente novamente.');
        }
    }
}

async function editarEmprestimo(id) {
    abrirModalEmprestimo(id);
}

async function cancelarEmprestimo(id) {
    mostrarConfirmacao('Tem certeza que deseja cancelar este empréstimo? O livro será devolvido ao estoque.', async () => {
        try {
            const response = await fetch(`${API_URL}/emprestimos/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                carregarEmprestimos();
                mostrarSucesso('Empréstimo cancelado com sucesso!');
            } else {
                const error = await response.json();
                mostrarErro(error.error || 'Erro ao cancelar empréstimo');
            }
        } catch (error) {
            console.error('Erro ao cancelar empréstimo:', error);
            mostrarErro('Erro ao cancelar empréstimo');
        }
    });
}

async function reverterDevolucao(id) {
    mostrarConfirmacao('Tem certeza que deseja reverter a devolução? O livro será marcado como emprestado novamente.', async () => {
        try {
            const response = await fetch(`${API_URL}/emprestimos/${id}/reverter`, {
                method: 'PUT'
            });

            if (response.ok) {
                carregarEmprestimos();
                mostrarSucesso('Devolução revertida com sucesso!');
            } else {
                const error = await response.json();
                mostrarErro(error.error || 'Erro ao reverter devolução');
            }
        } catch (error) {
            console.error('Erro ao reverter devolução:', error);
            mostrarErro('Erro ao reverter devolução');
        }
    });
}

async function devolverLivro(id) {
    mostrarConfirmacao('Confirmar devolução do livro?', async () => {
        try {
            const response = await fetch(`${API_URL}/emprestimos/${id}/devolver`, {
                method: 'PUT'
            });

            if (response.ok) {
                const result = await response.json();
                carregarEmprestimos();
                if (result.multa > 0) {
                    mostrarSucesso(`Livro devolvido! Multa aplicada: R$ ${result.multa.toFixed(2)} (${result.dias_atraso} dias de atraso)`);
                } else {
                    mostrarSucesso('Livro devolvido com sucesso!');
                }
            } else {
                const error = await response.json();
                mostrarErro(error.error || 'Erro ao devolver livro');
            }
        } catch (error) {
            console.error('Erro ao devolver livro:', error);
            mostrarErro('Não foi possível devolver o livro. Tente novamente.');
        }
    });
}

// ========== FUNÇÕES AUXILIARES ==========

function mostrarSucesso(mensagem) {
    const modal = document.getElementById('modalNotificacao');
    const icon = document.getElementById('notificacaoIcon');
    const message = document.getElementById('notificacaoMessage');
    
    modal.classList.add('success');
    modal.classList.remove('error');
    
    icon.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
    `;
    
    message.textContent = mensagem;
    modal.classList.add('active');
    
    // Fechar automaticamente após 3 segundos
    setTimeout(() => {
        fecharNotificacao();
    }, 3000);
}

function mostrarErro(mensagem) {
    const modal = document.getElementById('modalNotificacao');
    const icon = document.getElementById('notificacaoIcon');
    const message = document.getElementById('notificacaoMessage');
    
    modal.classList.add('error');
    modal.classList.remove('success');
    
    icon.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
    `;
    
    message.textContent = mensagem;
    modal.classList.add('active');
}

function fecharNotificacao() {
    const modal = document.getElementById('modalNotificacao');
    modal.classList.remove('active');
}

// ========== MODAL DE CONFIRMAÇÃO ==========

let confirmacaoCallback = null;

function mostrarConfirmacao(mensagem, callback) {
    const modal = document.getElementById('modalConfirmacao');
    const message = document.getElementById('confirmacaoMessage');
    const btnConfirmar = document.getElementById('btnConfirmar');
    
    message.textContent = mensagem;
    confirmacaoCallback = callback;
    
    // Remover listeners anteriores
    const novoBtn = btnConfirmar.cloneNode(true);
    btnConfirmar.parentNode.replaceChild(novoBtn, btnConfirmar);
    
    // Adicionar novo listener
    document.getElementById('btnConfirmar').addEventListener('click', confirmarAcao);
    
    modal.classList.add('active');
}

function confirmarAcao() {
    if (confirmacaoCallback) {
        confirmacaoCallback();
    }
    fecharConfirmacao();
}

function cancelarConfirmacao() {
    fecharConfirmacao();
}

function fecharConfirmacao() {
    const modal = document.getElementById('modalConfirmacao');
    modal.classList.remove('active');
    confirmacaoCallback = null;
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // Fechar modal de notificação ao clicar fora
    const modalNotificacao = document.getElementById('modalNotificacao');
    if (event.target === modalNotificacao) {
        fecharNotificacao();
    }
    
    // Fechar modal de confirmação ao clicar fora (mas não confirma a ação)
    const modalConfirmacao = document.getElementById('modalConfirmacao');
    if (event.target === modalConfirmacao) {
        cancelarConfirmacao();
    }
}

// ========== FUNÇÕES DE ORDENAÇÃO ==========

function ordenarTabela(tabela, campo) {
    // Alternar direção se clicar no mesmo campo
    if (ordenacaoAtual[tabela].campo === campo) {
        ordenacaoAtual[tabela].direcao = ordenacaoAtual[tabela].direcao === 'asc' ? 'desc' : 'asc';
    } else {
        ordenacaoAtual[tabela].campo = campo;
        ordenacaoAtual[tabela].direcao = 'asc';
    }
    
    aplicarOrdenacao(tabela);
    atualizarIconesOrdenacao(tabela, campo);
}

function aplicarOrdenacao(tabela) {
    let dados = [];
    let ordenacao = ordenacaoAtual[tabela];
    
    // Se não houver campo definido, usar ID como padrão
    if (!ordenacao.campo) {
        ordenacao.campo = 'id';
        ordenacao.direcao = 'asc';
    }
    
    // Obter dados
    if (tabela === 'livros') {
        dados = [...dadosLivros];
    } else if (tabela === 'usuarios') {
        dados = [...dadosUsuarios];
    } else if (tabela === 'emprestimos') {
        dados = [...dadosEmprestimos];
    }
    
    // Ordenar
    dados.sort((a, b) => {
        let valorA = a[ordenacao.campo];
        let valorB = b[ordenacao.campo];
        
        // Tratar valores nulos/undefined
        if (valorA == null) valorA = '';
        if (valorB == null) valorB = '';
        
        // Converter para string para comparação
        if (typeof valorA === 'number' && typeof valorB === 'number') {
            return ordenacao.direcao === 'asc' ? valorA - valorB : valorB - valorA;
        }
        
        // Comparação de strings
        valorA = String(valorA).toLowerCase();
        valorB = String(valorB).toLowerCase();
        
        if (ordenacao.direcao === 'asc') {
            return valorA < valorB ? -1 : valorA > valorB ? 1 : 0;
        } else {
            return valorA > valorB ? -1 : valorA < valorB ? 1 : 0;
        }
    });
    
    // Exibir dados ordenados
    if (tabela === 'livros') {
        exibirLivros(dados);
    } else if (tabela === 'usuarios') {
        exibirUsuarios(dados);
    } else if (tabela === 'emprestimos') {
        exibirEmprestimos(dados);
    }
}

function atualizarIconesOrdenacao(tabela, campo) {
    // Resetar todos os ícones da tabela
    const tabelaId = tabela === 'livros' ? 'tabelaLivros' : 
                     tabela === 'usuarios' ? 'tabelaUsuarios' : 
                     'tabelaEmprestimos';
    
    document.querySelectorAll(`#${tabelaId} th.sortable .sort-icon`).forEach(icon => {
        icon.className = 'sort-icon';
    });
    
    // Atualizar ícone do campo atual
    const iconId = `sort-${tabela}-${campo}`;
    const icon = document.getElementById(iconId);
    if (icon) {
        icon.className = `sort-icon ${ordenacaoAtual[tabela].direcao}`;
    }
}

// Carregar dados iniciais
document.addEventListener('DOMContentLoaded', () => {
    // Dashboard é exibido por padrão, não precisa carregar dados
});

