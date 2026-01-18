// File: /api/download.js (Vercel Serverless Function)
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const { url, format, quality } = req.query;
    
    if (!url) {
        return res.status(400).json({ error: 'No URL provided' });
    }
    
    try {
        // Method 1: Use y2mate API
        const downloadUrl = await getY2MateDownload(url, format, quality);
        
        // Method 2: Fallback to savefrom
        if (!downloadUrl) {
            const savefromUrl = `https://en.savefrom.net/18/#url=${encodeURIComponent(url)}`;
            return res.json({ 
                downloadUrl: savefromUrl,
                note: 'You will be redirected to download page'
            });
        }
        
        return res.json({ downloadUrl });
        
    } catch (error) {
        console.error('Download error:', error);
        return res.status(500).json({ error: error.message });
    }
}

async function getY2MateDownload(youtubeUrl, format, quality) {
    try {
        const apiUrl = 'https://y2mate.guru/api/convert';
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            },
            body: JSON.stringify({
                url: youtubeUrl,
                format: format
            })
        });
        
        const data = await response.json();
        
        if (data.success && data.downloadUrl) {
            return data.downloadUrl;
        }
        
        return null;
    } catch (error) {
        console.log('Y2Mate failed, trying alternative...');
        return null;
    }
}
