import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/db/server';
import type { MarkReadPayload } from '@/modules/module_4/types';

/**
 * GET /api/notifications
 * Obtiene las últimas 20 notificaciones del usuario actual,
 * ordenadas por fecha de creación descendente (más recientes primero).
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Inicializar la conexión a Supabase
    const supabase = await createClient();

    // Obtener el usuario actual desde el header
    const currentUserId = request.headers.get('x-user-id');
    if (!currentUserId) {
      return NextResponse.json(
        { error: 'No se proporcionó el ID del usuario. Se requiere el header x-user-id.' },
        { status: 400 }
      );
    }

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error al consultar notificaciones:', error.message);
      return NextResponse.json(
        { error: 'Error al obtener las notificaciones.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, notifications },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error inesperado en GET /api/notifications:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications
 * Si se envía un array de IDs, marca solo esas.
 * Si el array está vacío o no se envía, marca TODAS las del usuario.
 */
export async function PATCH(request: NextRequest) {
  try {
    // 1. Inicializar la conexión a Supabase
    const supabase = await createClient();

    // Obtener el usuario actual desde el header
    const currentUserId = request.headers.get('x-user-id');
    if (!currentUserId) {
      return NextResponse.json(
        { error: 'No se proporcionó el ID del usuario. Se requiere el header x-user-id.' },
        { status: 400 }
      );
    }

    let body: MarkReadPayload = {};
    try {
      body = await request.json();
    } catch {
      // Si el body no es JSON válido, usar un objeto vacío
    }
    const { notificationIds } = body;

    let query = supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', currentUserId);

    // Si se proporcionan IDs específicos, filtrar por ellos
    if (notificationIds && notificationIds.length > 0) {
      query = query.in('id', notificationIds);
    }

    const { error } = await query;

    if (error) {
      console.error('Error al marcar notificaciones como leídas:', error.message);
      return NextResponse.json(
        { error: 'Error al actualizar las notificaciones.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Notificaciones marcadas como leídas.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error inesperado en PATCH /api/notifications:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}