-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS biblioteca_if;
USE biblioteca_if;

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    tipo ENUM('aluno', 'professor', 'funcionario') NOT NULL,
    matricula VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Livros
CREATE TABLE IF NOT EXISTS livros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    editora VARCHAR(100),
    ano_publicacao INT,
    quantidade_total INT DEFAULT 1,
    quantidade_disponivel INT DEFAULT 1,
    categoria VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Empréstimos
CREATE TABLE IF NOT EXISTS emprestimos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    livro_id INT NOT NULL,
    usuario_id INT NOT NULL,
    data_emprestimo DATE NOT NULL,
    data_devolucao_prevista DATE NOT NULL,
    data_devolucao_real DATE NULL,
    status ENUM('ativo', 'devolvido', 'atrasado') DEFAULT 'ativo',
    multa DECIMAL(10, 2) DEFAULT 0.00,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (livro_id) REFERENCES livros(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_data_devolucao (data_devolucao_prevista)
);

-- Trigger para atualizar quantidade disponível ao criar empréstimo
DELIMITER //
CREATE TRIGGER atualizar_quantidade_emprestimo
AFTER INSERT ON emprestimos
FOR EACH ROW
BEGIN
    IF NEW.status = 'ativo' THEN
        UPDATE livros 
        SET quantidade_disponivel = quantidade_disponivel - 1 
        WHERE id = NEW.livro_id;
    END IF;
END//
DELIMITER ;

-- Trigger para atualizar quantidade disponível ao devolver
DELIMITER //
CREATE TRIGGER atualizar_quantidade_devolucao
AFTER UPDATE ON emprestimos
FOR EACH ROW
BEGIN
    IF OLD.status = 'ativo' AND NEW.status = 'devolvido' THEN
        UPDATE livros 
        SET quantidade_disponivel = quantidade_disponivel + 1 
        WHERE id = NEW.livro_id;
    END IF;
END//
DELIMITER ;

-- View para empréstimos com informações completas
CREATE OR REPLACE VIEW vw_emprestimos_completos AS
SELECT 
    e.id,
    e.data_emprestimo,
    e.data_devolucao_prevista,
    e.data_devolucao_real,
    e.status,
    e.multa,
    l.titulo AS livro_titulo,
    l.autor AS livro_autor,
    u.nome AS usuario_nome,
    u.email AS usuario_email,
    u.tipo AS usuario_tipo,
    DATEDIFF(CURDATE(), e.data_devolucao_prevista) AS dias_atraso
FROM emprestimos e
INNER JOIN livros l ON e.livro_id = l.id
INNER JOIN usuarios u ON e.usuario_id = u.id;

