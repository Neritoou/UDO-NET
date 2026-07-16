'use server';

import { mockPosts } from '@module_3/posts/exports'; 

// realiza la busqueda como parametro oblicatorio cualquier termino, la comunidad y los tags son metodos opcionales, la busqueda funciona solo con cualquier termino
export async function searchPosts(term: string, community?: string, tags?: string[], filter: string = 'recientes') {
    try {
        if (!term || term.trim() === '') {
            return [];
        } // si no el parametro de termino que el obligatorio esta vacio, no se va a mostrar nada

        const searchQuery = term.trim().toLowerCase();

        await new Promise((resolve) => setTimeout(resolve, 500));
         // esto no es mucho solo a traves de los datos falsos se filtra segun los parametros de busqueda
        const results = mockPosts.filter((post) => {
            const matchesTerm =
                post.title.toLowerCase().includes(searchQuery)||
                post.content.toLowerCase().includes(searchQuery)||
                post.tags.some(tag => tag.toLowerCase().includes(searchQuery)) || (post.community && post.community.toLowerCase().includes(searchQuery));
            
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
        console.error("Error al realizar la busqueda:", error);
        return [];
    }
}