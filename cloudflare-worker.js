// Cloudflare Worker - Bilibili API CORS Proxy
// Service Worker syntax (compatible with Cloudflare API deployment)

addEventListener('fetch', function(event) {
  event.respondWith(handleRequest(event.request));
});

addEventListener('options', function(event) {
  event.respondWith(new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    }
  }));
});

async function handleRequest(request) {
  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response('Method not allowed', {
      status: 405,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }

  var url = new URL(request.url);
  var mediaId = url.searchParams.get('media_id');

  if (!mediaId || !/^\d+$/.test(mediaId)) {
    return new Response(JSON.stringify({ code: -1, message: 'Missing or invalid media_id parameter' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }

  // Forward to Bilibili API with full browser headers
  var biliUrl = 'https://api.bilibili.com/pgc/review/user?media_id=' + mediaId;

  try {
    var response = await fetch(biliUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com/bangumi/media/md' + mediaId,
        'Origin': 'https://www.bilibili.com',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
      }
    });

    var text = await response.text();
    
    // Try to parse as JSON
    try {
      var data = JSON.parse(text);
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'public, max-age=3600',
        }
      });
    } catch (parseErr) {
      // Return the raw text for debugging
      return new Response(JSON.stringify({ 
        code: -1, 
        message: 'Bilibili API returned non-JSON response',
        status: response.status,
        preview: text.substring(0, 500)
      }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ code: -1, message: 'Failed to fetch Bilibili API: ' + e.message }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}
