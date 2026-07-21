export const authors = [
  {
    id: 1,
    name: "George Orwell",
    email: "george.orwell@example.com",
    bio: "English novelist, essayist, journalist and critic.",
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: "Jane Austen",
    email: "jane.austen@example.com",
    bio: "English novelist known primarily for her six major novels.",
    created_at: new Date().toISOString()
  }
];

export const posts = [
  {
    id: 1,
    author_id: 1,
    title: "1984",
    content: "A dystopian social science fiction novel and cautionary tale.",
    published: true,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    author_id: 1,
    title: "Animal Farm",
    content: "An allegorical novella that tells the story of a group of farm animals.",
    published: true,
    created_at: new Date().toISOString()
  }
];
