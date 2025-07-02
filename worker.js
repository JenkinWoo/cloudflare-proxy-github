const ASSET_URL = 'https://proxy.frp.gs/'
const PREFIX = '/'
// 分支文件使用jsDelivr镜像的开关，0为关闭，默认关闭
const Config = {
  jsdelivr: 0
}

const whiteList = [] // 白名单，路径里面有包含字符的才会通过，e.g. ['/username/']

/** @type {ResponseInit} */
const PREFLIGHT_INIT = {
  status: 204,
  headers: new Headers({
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PUT,PATCH,TRACE,DELETE,HEAD,OPTIONS',
    'access-control-max-age': '1728000',
  }),
}


const exp1 = /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/(?:releases|archive)\/.*$/i
const exp2 = /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/(?:blob|raw)\/.*$/i
const exp3 = /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/(?:info|git-).*$/i
const exp4 = /^(?:https?:\/\/)?raw\.(?:githubusercontent|github)\.com\/.+?\/.+?\/.+?\/.+$/i
const exp5 = /^(?:https?:\/\/)?gist\.(?:githubusercontent|github)\.com\/.+?\/.+?\/.+$/i
const exp6 = /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/tags.*$/i

/**
 * @param {any} body
 * @param {number} status
 * @param {Object<string, string>} headers
 */
function makeRes(body, status = 200, headers = {}) {
  headers['access-control-allow-origin'] = '*'
  return new Response(body, { status, headers })
}


/**
 * @param {string} urlStr
 */
function newUrl(urlStr) {
  try {
    return new URL(urlStr)
  } catch (err) {
    return null
  }
}


addEventListener('fetch', e => {
  const ret = fetchHandler(e)
    .catch(err => makeRes('cfworker error:\n' + err.stack, 502))
  e.respondWith(ret)
})


function checkUrl(u) {
  for (let i of [exp1, exp2, exp3, exp4, exp5, exp6]) {
    if (u.search(i) === 0) {
      return true
    }
  }
  return false
}

/**
 * @param {FetchEvent} e
 */
async function fetchHandler(e) {
  const req = e.request
  const urlObj = new URL(req.url)
  let path = urlObj.searchParams.get('q') // 原始gh-proxy的参数方式
  const requestPath = urlObj.pathname // 获取请求路径

  // --- 在这里添加返回自定义HTML页面的逻辑 ---
  if (requestPath === PREFIX || requestPath === `${PREFIX}index.html`) {
    const customHtmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GitHub 文件加速 - Cloudflare Workers</title>
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-color: #3B82F6; 
            --primary-hover-color: #60A5FA;
            --secondary-text-color: #6B7280; 
            --border-color: #E5E7EB; 
            --bg-light: #F9FAFB; 
            --bg-card: #FFFFFF; 
            --shadow-light: 0 4px 12px rgba(0, 0, 0, 0.08); 
            --shadow-medium: 0 8px 24px rgba(0, 0, 0, 0.12); 
        }

        body {
            font-family: 'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 50px;
            padding-bottom: 50px; 
            min-height: 100vh;
            margin: 0;
            background-color: var(--bg-light); 
            color: #333;
            overflow-x: hidden;
            box-sizing: border-box;
        }

        .container {
            background-color: var(--bg-card);
            padding: 40px; 
            border-radius: 16px; 
            box-shadow: var(--shadow-medium); 
            text-align: center;
            max-width: 760px; 
            width: 90%;
            box-sizing: border-box;
            opacity: 0; 
            transform: translateY(20px); 
            animation: fadeInSlideUp 0.8s ease-out forwards;
        }

        @keyframes fadeInSlideUp {
            from { opacity: 0; transform: translateY(50px); }
            to { opacity: 1; transform: translateY(0); }
        }

        h1 {
            color: #2C3E50; 
            margin-bottom: 35px; 
            font-size: 2.5em; 
            font-weight: 700; 
            letter-spacing: -0.02em; 
        }

        .input-group {
            margin-bottom: 30px;
        }

        input[type="text"] {
            width: calc(100% - 24px); 
            padding: 14px 12px; 
            border: 1px solid var(--border-color); 
            border-radius: 10px; 
            font-size: 1.05em; 
            box-sizing: border-box;
            transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
            color: #333;
        }

        input[type="text"]:focus {
            border-color: var(--primary-color); 
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
            transform: scale(1.005);
            outline: none;
        }

        button {
            background-color: var(--primary-color); 
            color: white;
            padding: 14px 40px; 
            border: none;
            border-radius: 10px; 
            font-size: 1.15em; 
            font-weight: 600; 
            cursor: pointer;
            transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3); 
        }

        button:hover {
            background-color: var(--primary-hover-color); 
            transform: translateY(-3px); 
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4); 
        }

        button:active {
            transform: translateY(-1px); 
            background-color: #2563EB; 
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
        }

        .section-separator {
            margin-top: 35px;
            padding-top: 35px;
            border-top: 1px dashed var(--border-color); 
        }
        .notes:first-of-type, .usage-tips:first-of-type { 
            border-top: none;
            padding-top: 0;
            margin-top: 0;
        }


        .notes, .usage-tips {
            text-align: left;
            padding: 0 10px;
            line-height: 1.7; 
            color: var(--secondary-text-color); 
            font-size: 0.95em; 
        }

        .notes p, .usage-tips p {
            margin-bottom: 12px; 
        }

        .notes a, .usage-tips a {
            color: var(--primary-color);
            text-decoration: none;
            transition: color 0.3s ease;
            font-weight: 600; 
        }

        .notes a:hover, .usage-tips a:hover {
            text-decoration: underline;
            color: var(--primary-hover-color);
        }

        .usage-tips h2 {
            font-size: 1.3em; 
            color: #2C3E50;
            margin-bottom: 20px; 
            text-align: center;
            font-weight: 600;
        }

        .usage-tips ol {
            list-style-type: decimal;
            padding-left: 25px; 
            margin: 0;
        }
        .usage-tips li {
            margin-bottom: 10px; 
        }
        .usage-tips code {
            background-color: #F3F4F6; 
            padding: 3px 6px;
            border-radius: 6px; 
            font-family: 'Roboto Mono', monospace; 
            color: #C2410C; 
            font-size: 0.9em;
        }
        .usage-tips pre {
            background-color: #EFF6FF; 
            border: 1px solid #DBEAFE; 
            border-radius: 8px;
            padding: 15px;
            margin-top: 15px;
            overflow-x: auto; 
        }

        .footer {
            margin-top: 60px; 
            font-size: 0.88em; 
            color: var(--secondary-text-color); 
            text-align: center;
        }

        .footer a {
            color: var(--secondary-text-color);
            text-decoration: none;
            transition: color 0.3s ease;
        }

        .footer a:hover {
            color: var(--primary-color);
            text-decoration: underline;
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
            body {
                padding-top: 30px;
                padding-bottom: 30px;
            }
            .container {
                padding: 30px 20px;
                border-radius: 12px;
            }
            h1 {
                font-size: 2em;
                margin-bottom: 25px;
            }
            input[type="text"] {
                padding: 10px 10px;
                font-size: 0.95em;
            }
            button {
                padding: 10px 30px;
                font-size: 1em;
            }
            .notes, .usage-tips {
                font-size: 0.88em;
                padding: 0; 
            }
            .usage-tips h2 {
                font-size: 1.1em;
            }
            .footer {
                margin-top: 40px;
                font-size: 0.8em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>GitHub 文件加速</h1>

        <div class="input-group">
            <input type="text" id="githubLink" placeholder="键入GitHub文件链接">
        </div>

        <button id="download">下载</button>

        <div class="notes section-separator">
            <p><strong>PS:</strong> GitHub链接不带协议头都可以，支持<code>release</code>、<code>archive</code>以及<code>文件</code>。右键复制出来的链接都是符合标准的，更多用法、clone加速请参考<a href="https://github.com/JenkinWoo/cloudflare-proxy-github#%E4%BD%BF%E7%94%A8%E6%96%B9%E6%B3%95" target="_blank">项目README</a>。</p>
            <p><code>release</code>、<code>archive</code>会直接跳转至JsDelivr进行CDN加速。</p>
            <p><strong>注意，不支持项目文件夹（即整个仓库下载）</strong></p>
        </div>

        <div class="usage-tips section-separator">
            <h2>使用方法</h2>
            <ol>
                <li>从GitHub页面复制您想要加速的文件链接，例如：
                    <code>https://github.com/torvalds/linux/archive/refs/tags/v6.9.zip</code> 或
                    <code>https://github.com/microsoft/vscode/blob/main/README.md</code>
                </li>
                <li>将复制的链接粘贴到上方的输入框中。</li>
                <li>点击“下载”按钮，文件将通过本加速服务进行传输或跳转至CDN。</li>
                <li>对于<code>git clone</code>加速，请在您的终端中设置代理：
                    <pre><code>
                    git config --global http.proxy <span id="proxyAddress1">http://proxy.frp.gs</span>
                    git config --global https.proxy <span id="proxyAddress2">https://proxy.frp.gs</span>
                    </code></pre>
                </li>
                <li>对于<code>npm</code>、<code>yarn</code>等包管理工具加速，类似设置<code>proxy</code>或<code>registry</code>：
                    <pre><code>npm config set proxy <span id="proxyAddress3">http://proxy.frp.gs</span>
npm config set https-proxy <span id="proxyAddress4">https://proxy.frp.gs</span></code></pre>
                </li>
            </ol>
            <p><em>提示：本页面的加速功能基于 <a href="https://cloudflare.com/workers" target="_blank">JenkinWoo/cloudflare-proxy-github</a>，它通过Cloudflare Workers将GitHub内容代理，实现加速访问。</em></p>
        </div>
    </div>

    <div class="footer">
        项目基于 <a href="https://cloudflare.com/workers" target="_blank">Cloudflare Workers</a>，开源于GitHub <a href="https://github.com/JenkinWoo/cloudflare-proxy-github" target="_blank">JenkinWoo/cloudflare-proxy-github</a>
    </div>

    <script>
        // 定义您的固定域名
        const MY_WORKER_DOMAIN = "proxy.frp.gs";

        document.addEventListener('DOMContentLoaded', function() {
            // 直接使用固定的域名更新提示
            document.getElementById('proxyAddress1').textContent = \`http://\${MY_WORKER_DOMAIN}\`;
            document.getElementById('proxyAddress2').textContent = \`https://\${MY_WORKER_DOMAIN}\`;
            document.getElementById('proxyAddress3').textContent = \`http://\${MY_WORKER_DOMAIN}\`;
            document.getElementById('proxyAddress4').textContent = \`https://\${MY_WORKER_DOMAIN}\`;

            document.getElementById('download').onclick = function() {
              const linkInput = document.getElementById('githubLink');
              let githubLink = linkInput.value.trim();

              if (!githubLink) {
                  alert('请输入GitHub文件链接！');
                  return;
              }

              // 构建加速链接，使用您提供的固定域名
              const acceleratedUrl = \`https://\${MY_WORKER_DOMAIN}/\${githubLink}\`;

              window.open(acceleratedUrl, '_blank'); // 在新标签页打开加速后的链接
            }
        });
    </script>
</body>
</html>
`
    return new Response(customHtmlContent, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    })
  }

  if (path) {
    return Response.redirect('https://' + urlObj.host + PREFIX + path, 301)
  }

  path = urlObj.href.substr(urlObj.origin.length + PREFIX.length).replace(/^https?:\/+/, 'https://')
  if (path.search(exp1) === 0 || path.search(exp5) === 0 || path.search(exp6) === 0 || path.search(exp3) === 0 || path.search(exp4) === 0) {
    return httpHandler(req, path)
  } else if (path.search(exp2) === 0) {
    if (Config.jsdelivr) {
      const newUrl = path.replace('/blob/', '@').replace(/^(?:https?:\/\/)?github\.com/, 'https://cdn.jsdelivr.net/gh')
      return Response.redirect(newUrl, 302)
    } else {
      path = path.replace('/blob/', '/raw/')
      return httpHandler(req, path)
    }
  } else if (path.search(exp4) === 0) {
    const newUrl = path.replace(/(?<=com\/.+?\/.+?)\/(.+?\/)/, '@$1').replace(/^(?:https?:\/\/)?raw\.(?:githubusercontent|github)\.com/, 'https://cdn.jsdelivr.net/gh')
    return Response.redirect(newUrl, 302)
  } else {
    return fetch(ASSET_URL + path)
  }
}


/**
 * @param {Request} req
 * @param {string} pathname
 */
function httpHandler(req, pathname) {
  const reqHdrRaw = req.headers

  // preflight
  if (req.method === 'OPTIONS' &&
    reqHdrRaw.has('access-control-request-headers')
  ) {
    return new Response(null, PREFLIGHT_INIT)
  }

  const reqHdrNew = new Headers(reqHdrRaw)

  let urlStr = pathname
  let flag = !Boolean(whiteList.length)
  for (let i of whiteList) {
    if (urlStr.includes(i)) {
      flag = true
      break
    }
  }
  if (!flag) {
    return new Response("blocked", { status: 403 })
  }
  if (urlStr.search(/^https?:\/\//) !== 0) {
    urlStr = 'https://' + urlStr
  }
  const urlObj = newUrl(urlStr)

  /** @type {RequestInit} */
  const reqInit = {
    method: req.method,
    headers: reqHdrNew,
    redirect: 'manual',
    body: req.body
  }
  return proxy(urlObj, reqInit)
}


/**
 *
 * @param {URL} urlObj
 * @param {RequestInit} reqInit
 */
async function proxy(urlObj, reqInit) {
  const res = await fetch(urlObj.href, reqInit)
  const resHdrOld = res.headers
  const resHdrNew = new Headers(resHdrOld)

  const status = res.status

  if (resHdrNew.has('location')) {
    let _location = resHdrNew.get('location')
    if (checkUrl(_location))
      resHdrNew.set('location', PREFIX + _location)
    else {
      reqInit.redirect = 'follow'
      return proxy(newUrl(_location), reqInit)
    }
  }
  resHdrNew.set('access-control-expose-headers', '*')
  resHdrNew.set('access-control-allow-origin', '*')

  resHdrNew.delete('content-security-policy')
  resHdrNew.delete('content-security-policy-report-only')
  resHdrNew.delete('clear-site-data')

  return new Response(res.body, {
    status,
    headers: resHdrNew,
  })
}