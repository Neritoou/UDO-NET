'use client';

import {useState, useEffect} from 'react';
import { getThread } from '@module_3/posts/actions/thread';
import { MockPost, MockReply } from '@module_3/posts/services/mock-data';

interface ThreadViewProp{
    threadId: string;
    onBack: () => void;
}

function Comments({reply, level = 0}: {reply: MockReply, level?: number}) {
    const indentation = level * 20;

    return(
        <div style={{marginLeft: `${indentation}px`, borderLeft: '2px solid #ddd', padding: '10px', marginTop: '15px'}}>
            <div style={{fontSize: '12px', color: '#2487ff', marginBottom: '5px'}}>
                <strong>{reply.author.username}</strong> • {reply.votes} votos
            </div>
            <p style={{margin: '0 0 10px 0', fontSize:'14px'}}>{reply.content}</p>

            <button style={{fontSize: '12px', padding:'2px 8px', cursor:'pointer'}}>Responder</button>

            {reply.nestedReplies && reply.nestedReplies.length > 0 && (
                <div style={{marginTop: '10px'}}>
                    {reply.nestedReplies.map((child) => (
                        <Comments key={child.id} reply={child} level={level + 1}/>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ThreadView({threadId, onBack}: ThreadViewProp){
    const [thread, setThread] = useState<MockPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const data = await getThread(threadId);
            setThread(data);
            setLoading(false);
        };
        loadData();
    }, [threadId]);

    if (loading) return <div style={{padding: '20px'}}>Cargando hilo</div>;

    if (!thread) return(
        <div style={{padding: '20px'}}>
            <button onClick={onBack} style={{marginBottom: '15px', cursor: 'pointer'}}>← Volver Atras</button>
            <p>El Hilo no existe o fue eliminado.</p>
        </div>
    );

    const statusColor = thread.status === 'Resuelto' ? 'green' : thread.status === 'Fijado' ? 'orange' : 'blue';

    return (
        <div style={{padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto'}}>
            <button
                onClick={onBack}
                style={{marginBottom: '20px', padding: '8px 16px', cursor: 'pointer', border: '1px solid #1900f6', borderRadius: '4px', backgroundColor: '#0f8593'}}
            >
                ← Volver Atras
            </button>

            <div style={{border: '1px solid #fcf6f6', padding: '20px', borderRadius: '8px', backgroundColor: '#424141'}}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#fffbfb' }}>
                        F / {thread.community}
                    </span>
                    <span style={{ backgroundColor: statusColor, color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' }}>
                        {thread.status}
                    </span>
            

                <h1 style={{margin: '0 0 15px 0', fontSize: '24px'}}>{thread.title}</h1>
                <p style={{ fontSize: '16px', lineHeight: '1.5' }}>{thread.content}</p>
                
                <div style={{ marginTop: '15px', display: 'flex', gap: '5px' }}>
                    {thread.tags.map(tag => (
                        <span key={tag} style={{ backgroundColor: '#818080', padding: '3px 8px', borderRadius: '4px', fontSize: '12px' }}>
                            #{tag}
                        </span>
                    ))}
                </div>
            
                <div style={{ marginTop: '20px', fontSize: '12px', color: '#fffafa', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
                    Autor: <strong>{thread.author.username}</strong> • Votos: {thread.votes}
                </div>            
            </div>

            <h3 style={{marginTop: '30px'}}>Respuestas({thread.repliesCount})</h3>
            <hr style={{marginBottom: '20px'}} />

            <div>
                {thread.replies.length === 0 ? (
                    <p style={{ color: '#b6b6b6' }}>No hay respuestas aún.</p>
                ) : (
                    thread.replies.map((reply) => (
                        <Comments key={reply.id} reply={reply} />
                    ))
                )}
            </div>
        </div>
    );
}