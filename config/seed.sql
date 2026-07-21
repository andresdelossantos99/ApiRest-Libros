TRUNCATE TABLE posts, authors RESTART IDENTITY CASCADE;

INSERT INTO authors (name, email, bio) VALUES
('George Orwell', 'george.orwell@example.com', 'English novelist, essayist, journalist and critic.'),
('Jane Austen', 'jane.austen@example.com', 'English novelist known primarily for her six major novels.'),
('Gabriel García Márquez', 'gabo@example.com', 'Colombian novelist, short-story writer, screenwriter, and journalist.');

INSERT INTO posts (author_id, title, content, published) VALUES
(1, '1984', 'A dystopian social science fiction novel and cautionary tale.', true),
(1, 'Animal Farm', 'An allegorical novella that tells the story of a group of farm animals.', true),
(2, 'Pride and Prejudice', 'A romantic novel of manners written by Jane Austen.', true),
(3, 'One Hundred Years of Solitude', 'A multi-generational story of the Buendía family.', false);