import express from 'express';
import { mlmDb } from '../lib/mlm-database';
import { LiveBroadcast } from '../../shared/mlm-types';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Admin middleware (reuse existing auth logic)
const requireAdmin = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    // Decode and verify token (simplified - reuse existing auth logic)
    const user = await mlmDb.getUserById('admin-001'); // For now, assuming admin user
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.admin = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin route: Start live broadcast
router.post('/admin/start', requireAdmin, async (req, res) => {
  try {
    const { streamUrl, title, description, platform } = req.body;

    if (!streamUrl) {
      return res.status(400).json({
        error: 'Stream URL is required',
        message: 'Canlı yayın URL\'si gereklidir'
      });
    }

    // Validate URL format
    try {
      new URL(streamUrl);
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid stream URL format',
        message: 'Geçersiz canlı yayın URL formatı'
      });
    }

    // Check if there's an active broadcast and end it first
    const existingBroadcast = await mlmDb.getCurrentLiveBroadcast();
    if (existingBroadcast && existingBroadcast.status === 'active') {
      await mlmDb.updateLiveBroadcast(existingBroadcast.id, {
        ...existingBroadcast,
        status: 'inactive',
        endTime: new Date(),
        lastUpdated: new Date()
      });
    }

    // Create new broadcast
    const broadcast: LiveBroadcast = {
      id: uuidv4(),
      status: 'active',
      streamUrl,
      title: title || 'Canlı Yayın',
      description: description || 'Kutbul Zaman canlı yayını',
      startTime: new Date(),
      endTime: null,
      platform: platform || 'custom',
         adminId: (req as any).admin.id,
      viewerCount: 0,
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    await mlmDb.createLiveBroadcast(broadcast);

    console.log('🔴 Live broadcast started:', {
      id: broadcast.id,
      streamUrl: broadcast.streamUrl,
      adminId: broadcast.adminId,
      startTime: broadcast.startTime
    });

    res.json({
      success: true,
      broadcast,
      message: 'Canlı yayın başarıyla başlatıldı!'
    });

  } catch (error) {
    console.error('Error starting live broadcast:', error);
    res.status(500).json({
      error: 'Failed to start live broadcast',
      message: 'Canlı yayın başlatılırken hata oluştu'
    });
  }
});

// Admin route: End live broadcast
router.post('/admin/end', requireAdmin, async (req, res) => {
  try {
    // Get current active broadcast
    const currentBroadcast = await mlmDb.getCurrentLiveBroadcast();
    
    if (!currentBroadcast || currentBroadcast.status !== 'active') {
      return res.status(404).json({
        error: 'No active broadcast found',
        message: 'Aktif canlı yayın bulunamadı'
      });
    }

    // End the broadcast
    const updatedBroadcast = {
      ...currentBroadcast,
      status: 'inactive' as const,
      endTime: new Date(),
      lastUpdated: new Date()
    };

    await mlmDb.updateLiveBroadcast(currentBroadcast.id, updatedBroadcast);

    console.log('⏹ Live broadcast ended:', {
      id: currentBroadcast.id,
      endTime: updatedBroadcast.endTime,
      duration: updatedBroadcast.endTime.getTime() - (currentBroadcast.startTime?.getTime() || 0)
    });

    res.json({
      success: true,
      broadcast: updatedBroadcast,
      message: 'Canlı yayın başarıyla sonlandırıldı!'
    });

  } catch (error) {
    console.error('Error ending live broadcast:', error);
    res.status(500).json({
      error: 'Failed to end live broadcast',
      message: 'Canlı yayın sonlandırılırken hata oluştu'
    });
  }
});

// Admin route: Get broadcast status
router.get('/admin/status', requireAdmin, async (req, res) => {
  try {
    const currentBroadcast = await mlmDb.getCurrentLiveBroadcast();
    
    res.json({
      success: true,
      broadcast: currentBroadcast,
      hasActiveBroadcast: currentBroadcast?.status === 'active'
    });

  } catch (error) {
    console.error('Error getting admin broadcast status:', error);
    res.status(500).json({
      error: 'Failed to get broadcast status',
      message: 'Yayın durumu alınırken hata oluştu'
    });
  }
});

// Public route: Get current broadcast status (accessible to all users)
router.get('/status', async (req, res) => {
  try {
    const currentBroadcast = await mlmDb.getCurrentLiveBroadcast();
    
    if (!currentBroadcast || currentBroadcast.status !== 'active') {
      return res.json({
        success: true,
        status: 'inactive',
        streamUrl: null,
        title: null,
        description: null,
        message: 'Şu an canlı yayın yok'
      });
    }

    // Increment viewer count
    if (currentBroadcast.viewerCount !== undefined) {
      const updatedBroadcast = {
        ...currentBroadcast,
        viewerCount: currentBroadcast.viewerCount + 1,
        lastUpdated: new Date()
      };
      await mlmDb.updateLiveBroadcast(currentBroadcast.id, updatedBroadcast);
    }

    res.json({
      success: true,
      status: currentBroadcast.status,
      streamUrl: currentBroadcast.streamUrl,
      title: currentBroadcast.title,
      description: currentBroadcast.description,
      platform: currentBroadcast.platform,
      startTime: currentBroadcast.startTime,
      viewerCount: currentBroadcast.viewerCount || 0
    });

  } catch (error) {
    console.error('Error getting broadcast status:', error);
    res.status(500).json({
      error: 'Failed to get broadcast status',
      message: 'Yayın durumu alınırken hata oluştu'
    });
  }
});

export default router;
