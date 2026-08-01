'use server';

import { mockPosts } from '@module_3/posts/exports'; 

// Realiza la búsqueda como parámetro obligatorio cualquier término; la comunidad y los tags son parámetros opcionales.
export async function searchPosts(term: string, community?: string, tags?: string[], filter: string = 'recientes') {
    try {
        if (!term || term.trim() === '') {
            return [];
        }

        const searchQuery = term.trim().toLowerCase();

        const results = mockPosts.filter((post) => {
            const matchesTerm =
                post.title.toLowerCase().includes(searchQuery) ||
                post.content.toLowerCase().includes(searchQuery) ||
                post.tags.some(tag => tag.toLowerCase().includes(searchQuery)) || 
                (post.community && post.community.toLowerCase().includes(searchQuery));
            
            const matchesCommunity = community ? post.community === community : true;

            const matchesTags = tags && tags.length > 0 ? tags.some(tag => post.tags.includes(tag)) : true;

            return matchesTerm && matchesCommunity && matchesTags;
        });

        results.sort((a, b) => {
            if (filter === 'votados') {
                return (b.votes || 0) - (a.votes || 0);
            } else if (filter === 'respuestas') {
                return (b.repliesCount || 0) - (a.repliesCount || 0);
            } else {
                return b.createdAt.getTime() - a.createdAt.getTime();
            }
        });

        return results.slice(0, 10);
    } catch (error) {
        console.error("Error al realizar la búsqueda:", error);
        return [];
    }
}