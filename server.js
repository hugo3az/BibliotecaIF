const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuração do banco de dados
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'biblioteca_if',
    port: process.env.DB_PORT || 3306
};

// Pool de conexões
const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ========== ROTAS DE LIVROS ==========

// Listar todos os livros
app.get('/api/livros', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM livros ORDER BY titulo');
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar livros:', error);
        const errorMessage = error.code === 'ER_BAD_DB_ERROR' || error.code === 'ECONNREFUSED'
            ? 'Erro de conexão com o banco de dados. Verifique se o MySQL está rodando e se o banco "biblioteca_if" existe.'
            : error.message || 'Erro ao buscar livros';
        res.status(500).json({ error: errorMessage });
    }
});

// Buscar livro por ID
app.get('/api/livros/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM livros WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Erro ao buscar livro:', error);
        res.status(500).json({ error: 'Erro ao buscar livro' });
    }
});

// Buscar livros por título ou autor
app.get('/api/livros/busca/:termo', async (req, res) => {
    try {
        const termo = `%${req.params.termo}%`;
        const [rows] = await pool.execute(
            'SELECT * FROM livros WHERE titulo LIKE ? OR autor LIKE ? ORDER BY titulo',
            [termo, termo]
        );
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar livros:', error);
        res.status(500).json({ error: 'Erro ao buscar livros' });
    }
});

// Cadastrar novo livro
app.post('/api/livros', async (req, res) => {
    try {
        const { titulo, autor, isbn, editora, ano_publicacao, quantidade_total, categoria } = req.body;
        
        if (!titulo || !autor) {
            return res.status(400).json({ error: 'Título e autor são obrigatórios' });
        }

        const quantidade = quantidade_total || 1;
        const [result] = await pool.execute(
            'INSERT INTO livros (titulo, autor, isbn, editora, ano_publicacao, quantidade_total, quantidade_disponivel, categoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [titulo, autor, isbn || null, editora || null, ano_publicacao || null, quantidade, quantidade, categoria || null]
        );

        res.status(201).json({ id: result.insertId, message: 'Livro cadastrado com sucesso' });
    } catch (error) {
        console.error('Erro ao cadastrar livro:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'ISBN já cadastrado' });
        }
        res.status(500).json({ error: 'Erro ao cadastrar livro' });
    }
});

// Atualizar livro
app.put('/api/livros/:id', async (req, res) => {
    try {
        const { titulo, autor, isbn, editora, ano_publicacao, quantidade_total, categoria } = req.body;
        
        const [result] = await pool.execute(
            'UPDATE livros SET titulo = ?, autor = ?, isbn = ?, editora = ?, ano_publicacao = ?, quantidade_total = ?, categoria = ? WHERE id = ?',
            [titulo, autor, isbn || null, editora || null, ano_publicacao || null, quantidade_total, categoria || null, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }

        res.json({ message: 'Livro atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar livro:', error);
        res.status(500).json({ error: 'Erro ao atualizar livro' });
    }
});

// Deletar livro
app.delete('/api/livros/:id', async (req, res) => {
    try {
        const [result] = await pool.execute('DELETE FROM livros WHERE id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }

        res.json({ message: 'Livro deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar livro:', error);
        res.status(500).json({ error: 'Erro ao deletar livro' });
    }
});

// ========== ROTAS DE USUÁRIOS ==========

// Listar todos os usuários
app.get('/api/usuarios', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM usuarios ORDER BY nome');
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
});

// Buscar usuário por ID
app.get('/api/usuarios/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM usuarios WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
});

// Cadastrar novo usuário
app.post('/api/usuarios', async (req, res) => {
    try {
        const { nome, email, telefone, tipo, matricula } = req.body;
        
        if (!nome || !email || !tipo) {
            return res.status(400).json({ error: 'Nome, email e tipo são obrigatórios' });
        }

        const [result] = await pool.execute(
            'INSERT INTO usuarios (nome, email, telefone, tipo, matricula) VALUES (?, ?, ?, ?, ?)',
            [nome, email, telefone || null, tipo, matricula || null]
        );

        res.status(201).json({ id: result.insertId, message: 'Usuário cadastrado com sucesso' });
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email ou matrícula já cadastrado' });
        }
        res.status(500).json({ error: 'Erro ao cadastrar usuário' });
    }
});

// Atualizar usuário
app.put('/api/usuarios/:id', async (req, res) => {
    try {
        const { nome, email, telefone, tipo, matricula } = req.body;
        
        const [result] = await pool.execute(
            'UPDATE usuarios SET nome = ?, email = ?, telefone = ?, tipo = ?, matricula = ? WHERE id = ?',
            [nome, email, telefone || null, tipo, matricula || null, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json({ message: 'Usuário atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
});

// Deletar usuário
app.delete('/api/usuarios/:id', async (req, res) => {
    try {
        const [result] = await pool.execute('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
});

// ========== ROTAS DE EMPRÉSTIMOS ==========

// Listar todos os empréstimos
app.get('/api/emprestimos', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM vw_emprestimos_completos ORDER BY data_emprestimo DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar empréstimos:', error);
        res.status(500).json({ error: 'Erro ao buscar empréstimos' });
    }
});

// Buscar empréstimo por ID
app.get('/api/emprestimos/:id', async (req, res) => {
    try {
        // Buscar dados completos com IDs
        const [rows] = await pool.execute(
            `SELECT 
                e.*,
                l.titulo AS livro_titulo,
                l.autor AS livro_autor,
                u.nome AS usuario_nome,
                u.email AS usuario_email,
                u.tipo AS usuario_tipo
            FROM emprestimos e
            INNER JOIN livros l ON e.livro_id = l.id
            INNER JOIN usuarios u ON e.usuario_id = u.id
            WHERE e.id = ?`,
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Empréstimo não encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Erro ao buscar empréstimo:', error);
        res.status(500).json({ error: 'Erro ao buscar empréstimo' });
    }
});

// Criar novo empréstimo
app.post('/api/emprestimos', async (req, res) => {
    try {
        const { livro_id, usuario_id, dias_emprestimo } = req.body;
        
        if (!livro_id || !usuario_id) {
            return res.status(400).json({ error: 'Livro e usuário são obrigatórios' });
        }

        // Verificar se o livro está disponível
        const [livro] = await pool.execute('SELECT quantidade_disponivel FROM livros WHERE id = ?', [livro_id]);
        if (livro.length === 0) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }
        if (livro[0].quantidade_disponivel <= 0) {
            return res.status(400).json({ error: 'Livro não disponível para empréstimo' });
        }

        const dias = dias_emprestimo || 7; // Padrão: 7 dias
        const data_emprestimo = new Date();
        const data_devolucao_prevista = new Date();
        data_devolucao_prevista.setDate(data_devolucao_prevista.getDate() + dias);

        const [result] = await pool.execute(
            'INSERT INTO emprestimos (livro_id, usuario_id, data_emprestimo, data_devolucao_prevista, status) VALUES (?, ?, ?, ?, ?)',
            [livro_id, usuario_id, data_emprestimo, data_devolucao_prevista, 'ativo']
        );

        res.status(201).json({ id: result.insertId, message: 'Empréstimo realizado com sucesso' });
    } catch (error) {
        console.error('Erro ao criar empréstimo:', error);
        res.status(500).json({ error: 'Erro ao criar empréstimo' });
    }
});

// Devolver livro
app.put('/api/emprestimos/:id/devolver', async (req, res) => {
    try {
        const [emprestimo] = await pool.execute('SELECT * FROM emprestimos WHERE id = ?', [req.params.id]);
        
        if (emprestimo.length === 0) {
            return res.status(404).json({ error: 'Empréstimo não encontrado' });
        }

        if (emprestimo[0].status === 'devolvido') {
            return res.status(400).json({ error: 'Livro já foi devolvido' });
        }

        const data_devolucao = new Date();
        const data_prevista = new Date(emprestimo[0].data_devolucao_prevista);
        const dias_atraso = Math.max(0, Math.floor((data_devolucao - data_prevista) / (1000 * 60 * 60 * 24)));
        
        // Calcular multa: R$ 2,00 por dia de atraso
        const multa_por_dia = 2.00;
        const multa = dias_atraso > 0 ? dias_atraso * multa_por_dia : 0;

        // Sempre marcar como devolvido ao realizar a devolução
        await pool.execute(
            'UPDATE emprestimos SET data_devolucao_real = ?, status = ?, multa = ? WHERE id = ?',
            [data_devolucao, 'devolvido', multa, req.params.id]
        );

        res.json({ 
            message: 'Livro devolvido com sucesso',
            multa: multa,
            dias_atraso: dias_atraso
        });
    } catch (error) {
        console.error('Erro ao devolver livro:', error);
        res.status(500).json({ error: 'Erro ao devolver livro' });
    }
});

// Atualizar empréstimo
app.put('/api/emprestimos/:id', async (req, res) => {
    try {
        const { data_emprestimo, data_devolucao_prevista, data_devolucao_real, status, multa } = req.body;
        
        const [emprestimo] = await pool.execute('SELECT * FROM emprestimos WHERE id = ?', [req.params.id]);
        if (emprestimo.length === 0) {
            return res.status(404).json({ error: 'Empréstimo não encontrado' });
        }

        // Atualizar empréstimo
        await pool.execute(
            'UPDATE emprestimos SET data_emprestimo = ?, data_devolucao_prevista = ?, data_devolucao_real = ?, status = ?, multa = ? WHERE id = ?',
            [
                data_emprestimo || emprestimo[0].data_emprestimo,
                data_devolucao_prevista || emprestimo[0].data_devolucao_prevista,
                data_devolucao_real !== undefined ? data_devolucao_real : emprestimo[0].data_devolucao_real,
                status || emprestimo[0].status,
                multa !== undefined ? multa : emprestimo[0].multa,
                req.params.id
            ]
        );

        res.json({ message: 'Empréstimo atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar empréstimo:', error);
        res.status(500).json({ error: 'Erro ao atualizar empréstimo' });
    }
});

// Cancelar empréstimo (deletar)
app.delete('/api/emprestimos/:id', async (req, res) => {
    try {
        const [emprestimo] = await pool.execute('SELECT * FROM emprestimos WHERE id = ?', [req.params.id]);
        
        if (emprestimo.length === 0) {
            return res.status(404).json({ error: 'Empréstimo não encontrado' });
        }

        // Se estava ativo, devolver o livro ao estoque
        if (emprestimo[0].status === 'ativo' || emprestimo[0].status === 'atrasado') {
            await pool.execute(
                'UPDATE livros SET quantidade_disponivel = quantidade_disponivel + 1 WHERE id = ?',
                [emprestimo[0].livro_id]
            );
        }

        await pool.execute('DELETE FROM emprestimos WHERE id = ?', [req.params.id]);

        res.json({ message: 'Empréstimo cancelado com sucesso' });
    } catch (error) {
        console.error('Erro ao cancelar empréstimo:', error);
        res.status(500).json({ error: 'Erro ao cancelar empréstimo' });
    }
});

// Reverter devolução
app.put('/api/emprestimos/:id/reverter', async (req, res) => {
    try {
        const [emprestimo] = await pool.execute('SELECT * FROM emprestimos WHERE id = ?', [req.params.id]);
        
        if (emprestimo.length === 0) {
            return res.status(404).json({ error: 'Empréstimo não encontrado' });
        }

        if (emprestimo[0].status !== 'devolvido') {
            return res.status(400).json({ error: 'Apenas empréstimos devolvidos podem ser revertidos' });
        }

        // Reverter: remover devolução e atualizar quantidade
        await pool.execute(
            'UPDATE emprestimos SET data_devolucao_real = NULL, status = ?, multa = 0.00 WHERE id = ?',
            ['ativo', req.params.id]
        );

        // Atualizar quantidade disponível do livro
        await pool.execute(
            'UPDATE livros SET quantidade_disponivel = quantidade_disponivel - 1 WHERE id = ?',
            [emprestimo[0].livro_id]
        );

        res.json({ message: 'Devolução revertida com sucesso' });
    } catch (error) {
        console.error('Erro ao reverter devolução:', error);
        res.status(500).json({ error: 'Erro ao reverter devolução' });
    }
});

// Atualizar status de empréstimos atrasados (rota para ser chamada periodicamente)
app.post('/api/emprestimos/atualizar-status', async (req, res) => {
    try {
        await pool.execute(
            `UPDATE emprestimos 
             SET status = 'atrasado' 
             WHERE status = 'ativo' 
             AND data_devolucao_prevista < CURDATE()`
        );
        res.json({ message: 'Status atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        res.status(500).json({ error: 'Erro ao atualizar status' });
    }
});

// Testar conexão com banco de dados
async function testarConexao() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexão com banco de dados estabelecida!');
        connection.release();
    } catch (error) {
        console.error('❌ Erro ao conectar com o banco de dados:');
        console.error('   Verifique se:');
        console.error('   1. O MySQL está rodando');
        console.error('   2. O banco de dados "biblioteca_if" existe');
        console.error('   3. As credenciais no arquivo .env estão corretas');
        console.error('   4. Execute: mysql -u root -p < database/schema.sql');
        console.error(`\n   Erro: ${error.message}`);
    }
}

// Iniciar servidor
app.listen(PORT, async () => {
    console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📖 Acesse: http://localhost:${PORT}\n`);
    await testarConexao();
});

