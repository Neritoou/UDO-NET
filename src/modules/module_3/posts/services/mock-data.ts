// 1. Importamos el archivo JSON (Asegúrate de que la ruta empiece por ./ )
import mockPostsJson from '@module_3/posts/services/mock-posts-extra.json';
import { User } from '@/lib/types/user';

export interface MockPost {
    id: string;
    title: string;
    content: string;
    community: string;
    tags: string[];
    author: { username: string; };
    createdAt: Date;
    votes: number;
    repliesCount: number;
    status: 'Abierto' | 'Resuelto' | 'Fijado';
    replies: MockReply[];
    links?: string[];      // Campo opcional agregado
    linkMetadata?: {       // Campo opcional para soportar los datos del scraper de miniatura
        title: string;
        description: string;
        image: {
            url: string;
        };
    } | null;
}
export interface MockReply {
    id: string;
    author: { username: string; };
    content: string;
    createdAt: Date;
    votes: number;
    nestedReplies?: MockReply[];
}

// Tus publicaciones hardcodeadas originales
const staticPosts: MockPost[] = [
  {
    id: 'post_001',
    title: '¿Dónde está básico?',
    content: 'Me llamo leonel, soy nuevo ingreso y tengo que ver una materia en basico, llevo dando vueltas en circulos pero no se como llegar. Ayudenmeeeeee :Cccc',
    community: 'Laudopoo',
    tags: ['Medicina', 'Básico'],
    author: { username: 'Leonel' },
    createdAt: new Date('2026-06-20T10:00:00Z'),
    votes: 50,
    repliesCount: 3,
    status : 'Resuelto',
    replies: [
        {
            id: 'resp_1',
            author: { username: 'Joyce Valerio' },
            content: '¡Hola! El edificio de básico está justo detrás de la biblioteca central. No tiene pérdida.',
            createdAt: new Date('2026-06-20T10:15:00Z'),
            votes: 12,
            nestedReplies: [
                {
                    id: 'resp_1_1',
                    author: { username: 'Leonel' },
                    content: '¡Muchas gracias! Ya lo encontré. Me salvaste.',
                    createdAt: new Date('2026-06-20T10:20:00Z'),
                    votes: 2,
                }
            ]
        },
        {
            id: 'resp_2',
            author: { username: 'Nepthali' },
            content: 'Sigue a la multitud de nuevo ingreso, todos van para allá jaja.',
            createdAt: new Date('2026-06-20T10:18:00Z'),
            votes: 5,
        }
    ]
  },
  {
    id: 'post_002',
    title: 'Odio Sistemas',
    content: 'Me metí a Sistemas sin saber lo que estaba haciendo y ahora me arrepentí, quiero saber cómo puedo reparar mi error y cambiarme a la mejor carrera de todas, Ingeniería en Computación, alguien sabe cómo puedo iniciar el proceso???',
    community: 'General',
    tags: ['Sistemas', 'Computación', 'General'],
    author: { username: 'Nepthali' },
    createdAt: new Date('2026-06-21T14:30:00Z'),
    votes: 50,
    repliesCount: 1,
    status: 'Fijado',
    replies:[]
  },
  {
    id: 'post_003',
    title: 'Transistores BJT',
    content: 'Un transistor BJT (Transistor de Unión Bipolar) es un componente electrónico semiconductor que funciona como amplificador o interruptor.',
    community: 'F / DCYS',
    tags: ['Electrónica', 'Computación', 'Sistemas'],
    author: { username: 'Prof. Alfredo Marot' },
    createdAt: new Date('2026-06-22T08:15:00Z'),
    votes: 15,
    repliesCount: 2,
    status: 'Abierto',
    replies:[
      {
        id: 'resp_3',
        author: { username: 'Dano' },
        content: 'Deben Aplicar la teoria para entender los transistores BJT.',
        createdAt: new Date('2026-06-22T09:00:00Z'),
        votes: 30,
      }
    ]
  },
  {
    id: 'post_004',
    title: 'Demasiado fácil POO',
    content: 'Chicos, pasé POO, ya no tengo que ver más esa materia. Qué cursitos de programación recomiendan ver después de haber pasado POO chi???',
    community: 'Laudopoo',
    tags: ['Sistemas', 'Computación', 'POO'],
    author: { username: 'Nepthali' },
    createdAt: new Date('2026-06-23T19:45:00Z'),
    votes: 50,
    repliesCount: 0,
    status:'Resuelto',
    replies: [
      {
        id: 'resp_4',
        author: { username: 'Prof. Alfredo Marot' },
        content: 'Debes aplicar el cambio de carrera.',
        createdAt: new Date('2026-06-22T09:00:00Z'),
        votes: 30, 
      },
      {
        id: 'resp_5',
        author: { username: 'Admin_UDONET' },
        content: 'Esta publicacion sera eliminida.',
        createdAt: new Date('2026-06-22T09:00:00Z'),
        votes: 30,
        nestedReplies: [
          {
            id: 'resp_6',
            author: { username: 'Keiber' },
            content: '¿Alguien me explica de forma sencilla que es POO?.',
            createdAt: new Date('2026-06-20T10:18:00Z'),
            votes: 5,
          }
        ]
      }
    ]
  }
];

interface RawReply {
  id: string;
  author: { username: string };
  content: string;
  createdAt: string;
  votes: number;
  nestedReplies?: RawReply[];
}

interface RawPost {
  id: string;
  title: string;
  content: string;
  community: string;
  tags: string[];
  author: { username: string };
  createdAt: string;
  votes: number;
  repliesCount: number;
  status: 'Abierto' | 'Resuelto' | 'Fijado';
  replies: RawReply[];
  links?: string[];
  linkMetadata?: {
    title: string;
    description: string;
    image: { url: string };
  } | null;
}

// 2. Función auxiliar para transformar recursivamente las fechas del JSON de string a Date
const formatReplies = (replies: RawReply[]): MockReply[] => {
    return replies.map(resp => ({
        ...resp,
        createdAt: new Date(resp.createdAt),
        nestedReplies: resp.nestedReplies ? formatReplies(resp.nestedReplies) : undefined
    }));
};

// Mapeamos el JSON para corregir las fechas
const postsFromJson: MockPost[] = (mockPostsJson as unknown as RawPost[]).map((post) => ({
    ...post,
    createdAt: new Date(post.createdAt),
    replies: formatReplies(post.replies)
}));

// 3. Exportamos el arreglo final combinado usando el operador Spread (...)
export const mockPosts: MockPost[] = [
    ...staticPosts,
    ...postsFromJson
];

const mockProfiles: User[] = [
  { id: 'user_001', email: 'leonel@udo.edu.ve', username: 'Leonel', avatar_url: null, bio: 'Estudiante de medicina', is_public: true, role: 'regular', reputation: 100, created_at: new Date().toISOString() },
  { id: 'user_002', email: 'nepthali@udo.edu.ve', username: 'Nepthali', avatar_url: null, bio: 'Estudiante de computación', is_public: true, role: 'regular', reputation: 120, created_at: new Date().toISOString() },
  { id: 'user_003', email: 'joyce@udo.edu.ve', username: 'Joyce Valerio', avatar_url: null, bio: 'Estudiante de sistemas', is_public: true, role: 'regular', reputation: 150, created_at: new Date().toISOString() },
  { id: 'user_004', email: 'dano@udo.edu.ve', username: 'Dano', avatar_url: null, bio: 'Colaborador de UdoNET', is_public: true, role: 'moderator', reputation: 200, created_at: new Date().toISOString() },
  { id: 'user_005', email: 'keiber@udo.edu.ve', username: 'Keiber', avatar_url: null, bio: 'Estudiante', is_public: true, role: 'regular', reputation: 90, created_at: new Date().toISOString() },
];

export async function getRandomUserProfile(): Promise<User> {
  const randomIndex = Math.floor(Math.random() * mockProfiles.length);
  return mockProfiles[randomIndex];
}