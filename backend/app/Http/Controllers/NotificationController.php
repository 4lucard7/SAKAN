<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * GET /api/notifications
     * Retourne les notifications avec compteur des non-lues
     */
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->notifications()->latest('created_at');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->boolean('non_lues')) {
            $query->where('is_read', false);
        }

        $notifications = $query->paginate(20);
        $unreadCount   = $request->user()->notifications()->where('is_read', false)->count();

        return response()->json([
            'data'         => $notifications->items(),
            'unread_count' => $unreadCount,
            'total'        => $notifications->total(),
            'has_more'     => $notifications->hasMorePages(),
        ]);
    }

    /**
     * PATCH /api/notifications/{id}/lire
     * Bascule l'état lu/non-lu d'une notification (toggle)
     */
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $notif = $request->user()->notifications()->findOrFail($id);
        $notif->update(['is_read' => !$notif->is_read]);

        return response()->json($notif);
    }

    /**
     * PATCH /api/notifications/{id}/non-lue
     * Marque explicitement une notification comme non lue
     */
    public function markAsUnread(Request $request, int $id): JsonResponse
    {
        $notif = $request->user()->notifications()->findOrFail($id);
        $notif->update(['is_read' => false]);

        return response()->json($notif);
    }

    /**
     * POST /api/notifications/lire-tout
     * Marque toutes les notifications comme lues
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $count = $request->user()->notifications()->where('is_read', false)->update(['is_read' => true]);

        return response()->json(['message' => "$count notification(s) marquée(s) comme lue(s)."]);
    }

    /**
     * DELETE /api/notifications/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $notif = $request->user()->notifications()->findOrFail($id);
        $notif->delete();

        return response()->json(['message' => 'Notification supprimée.']);
    }

    /**
     * DELETE /api/notifications
     * Supprime toutes les notifications lues
     */
    public function destroyAll(Request $request): JsonResponse
    {
        $count = $request->user()->notifications()->where('is_read', true)->delete();

        return response()->json(['message' => "$count notification(s) supprimée(s)."]);
    }
}
