-- Dados de exemplo para teste
USE biblioteca_if;

-- Inserir usuários de exemplo
INSERT INTO usuarios (nome, email, telefone, tipo, matricula) VALUES
('João Silva', 'joao.silva@email.com', '(22) 99999-1111', 'aluno', '2024001'),
('Maria Santos', 'maria.santos@email.com', '(22) 99999-2222', 'aluno', '2024002'),
('Pedro Oliveira', 'pedro.oliveira@email.com', '(22) 99999-3333', 'professor', 'PROF001'),
('Ana Costa', 'ana.costa@email.com', '(22) 99999-4444', 'funcionario', 'FUNC001');

-- Inserir livros de exemplo
INSERT INTO livros (titulo, autor, isbn, editora, ano_publicacao, quantidade_total, quantidade_disponivel, categoria) VALUES
('Dom Casmurro', 'Machado de Assis', '978-85-359-0277-3', 'Globo', 1899, 3, 3, 'Literatura'),
('O Cortiço', 'Aluísio Azevedo', '978-85-250-4691-2', 'Nova Fronteira', 1890, 2, 2, 'Literatura'),
('Iracema', 'José de Alencar', '978-85-250-4692-9', 'Nova Fronteira', 1865, 2, 2, 'Literatura'),
('A Arte da Guerra', 'Sun Tzu', '978-85-7542-123-4', 'Martins Fontes', -500, 1, 1, 'Filosofia'),
('1984', 'George Orwell', '978-85-359-0278-0', 'Companhia das Letras', 1949, 2, 2, 'Ficção'),
('O Pequeno Príncipe', 'Antoine de Saint-Exupéry', '978-85-250-4693-6', 'Agir', 1943, 4, 4, 'Infantil');

