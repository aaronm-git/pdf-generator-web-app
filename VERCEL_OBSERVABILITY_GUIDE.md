# Vercel Observability & Platform Features Guide

A comprehensive guide to implementing Vercel's observability, compute, CDN, and service features for your application.

---

## Table of Contents

1. [Observability](#observability)
   - [Overview](#overview)
   - [Query](#query)
   - [Notebooks](#notebooks)
   - [Alerts (Beta)](#alerts-beta)

2. [Compute](#compute)
   - [Functions](#functions)
   - [External APIs](#external-apis)
   - [Middleware](#middleware)
   - [Workflows (Beta)](#workflows-beta)
   - [Runtime Cache](#runtime-cache)

3. [CDN](#cdn)
   - [Edge Requests](#edge-requests)
   - [Fast Data Transfer](#fast-data-transfer)
   - [Image Optimization](#image-optimization)
   - [ISR (Incremental Static Regeneration)](#isr-incremental-static-regeneration)
   - [External Rewrites](#external-rewrites)
   - [Microfrontends](#microfrontends)

4. [Deployments](#deployments)
   - [Build Diagnostics](#build-diagnostics)

5. [Services](#services)
   - [AI](#ai)
   - [Blob Storage](#blob-storage)

---

## OBSERVABILITY

### Overview

**What it is:** A dashboard providing high-level insights into your application's performance, traffic patterns, and deployment status.

**What it's for:** Monitoring overall health, viewing analytics summaries, and accessing deployment history.

**Documentation:** [Vercel Observability Documentation](https://vercel.com/docs/observability)

#### Implementation:

No code implementation needed. Simply navigate to the Observability tab in your Vercel Dashboard to view:
- Real-time traffic metrics
- Deployment status
- Performance indicators
- Recent deployments

---

### Query

**What it is:** A monitoring query interface that lets you analyze detailed metrics using SQL-like syntax (GROQ/SQL).

**What it's for:** Filtering and aggregating performance data, bandwidth usage, function invocations, and request metrics.

**Documentation:** [Vercel Monitoring Query Reference](https://vercel.com/docs/observability/monitoring/monitoring-reference)

#### Implementation:

Basic Query Patterns:

```sql
-- Filter by host and request path
host = 'my-site.com' and like(request_path, '/posts%')

-- Count edge requests
VISUALIZE Edge Requests AS Count

-- Monitor image optimization bandwidth
request_path = '/_next/image' OR request_path = '/_vercel/image' and host = 'my-site.com'

-- Filter by multiple hosts
WHERE host in ('vercel.com', 'nextjs.com')

-- Monitor with percentiles
VISUALIZE Duration AS 90th percentile
```

**Key Metrics:**
- Edge Requests
- Function Invocations
- Duration
- Bandwidth Usage
- Status codes

---

### Notebooks

**What it is:** An interactive environment for analyzing and visualizing observability data.

**What it's for:** Creating custom dashboards, exploring trends, and sharing analysis insights.

**Documentation:** [Vercel Notebooks Documentation](https://vercel.com/docs/observability)

#### Implementation:

1. Navigate to Observability → Notebooks
2. Create a new notebook
3. Write queries to analyze metrics
4. Visualize results in various chart formats
5. Save and share notebooks with team members

---

### Alerts (Beta)

**What it is:** Automated alerts that notify you when specific metrics exceed thresholds or anomalies are detected.

**What it's for:** Proactive monitoring, error rate tracking, and performance degradation notifications.

**Documentation:** [Vercel Alerts Documentation](https://vercel.com/docs/observability/alerts)

#### Implementation:

1. Navigate to Observability → Alerts
2. Create a new alert rule with:
   - Trigger condition (threshold, anomaly detection, etc.)
   - Metric to monitor (error rate, response time, bandwidth, etc.)
   - Notification channels (email, Slack, webhooks)
3. Set alert sensitivity and frequency

Example Alert Scenarios:
- Error rate exceeds 5%
- Average response time exceeds 1000ms
- Function execution time exceeds 30s
- Bandwidth usage spikes above normal

---

## COMPUTE

### Functions

**What it is:** Serverless functions (Node.js, Python, Go, etc.) that run on Vercel's infrastructure.

**What it's for:** Building API endpoints, handling background jobs, and running server-side logic without managing servers.

**Documentation:** [Vercel Functions Documentation](https://vercel.com/docs/functions)

#### Implementation:

**Create a Serverless Function (Node.js):**

```typescript
// api/hello.ts
import { NextRequest } from 'next/server';

export const config = {
  runtime: 'nodejs',
  memory: 1024,        // MB
  maxDuration: 60,     // seconds
  regions: ['iad1'],   // Vercel region
};

export default function handler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || 'World';

  return new Response(`Hello, ${name}!`);
}
```

**Configuration Options:**
- `runtime`: nodejs, python, go, etc.
- `memory`: 128-3008 MB
- `maxDuration`: 5-900 seconds
- `regions`: Deploy to specific Vercel regions
- `environment`: Environment variables

---

### External APIs

**What it is:** Integration layer for connecting to third-party APIs and microservices.

**What it's for:** Proxying API calls, managing authentication, caching external API responses.

**Documentation:** [Vercel External APIs & Integrations](https://vercel.com/docs/integrations)

#### Implementation:

**Route API Requests to External Service:**

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.example.com/:path*"
    }
  ]
}
```

**Set Up Caching for External APIs:**

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.example.com/:path*"
    }
  ],
  "headers": [
    {
      "source": "/api/:path*",
      "headers": [
        {
          "key": "CDN-Cache-Control",
          "value": "max-age=60"
        }
      ]
    }
  ]
}
```

**Enable Rewrite Caching:**

```json
{
  "headers": [
    {
      "source": "/api/:path*",
      "headers": [
        {
          "key": "x-vercel-enable-rewrite-caching",
          "value": "1"
        }
      ]
    }
  ]
}
```

---

### Middleware

**What it is:** Code that runs at the edge before your application receives requests.

**What it's for:** Authentication, request/response manipulation, geolocation routing, security headers.

**Documentation:** [Vercel Middleware Documentation](https://vercel.com/docs/routing-middleware)

#### Implementation:

**Create Routing Middleware (TypeScript):**

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { get } from '@vercel/edge-config';

export const config = {
  matcher: '/((?!api|_next/static|favicon.ico).*)',
};

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // Redirect old paths
  if (url.pathname === '/old-page') {
    return NextResponse.redirect(new URL('/new-page', request.url));
  }

  // Get rewrites from Edge Config
  const rewrites = await get('rewrites');
  for (const rewrite of rewrites) {
    if (rewrite.source === url.pathname) {
      url.pathname = rewrite.destination;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}
```

**Add Security Headers:**

```typescript
// middleware.ts
import { next } from '@vercel/functions';

export const config = {
  matcher: '/example',
};

export default function middleware(request: Request) {
  return next({
    headers: {
      'Referrer-Policy': 'origin-when-cross-origin',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    },
  });
}
```

**Runtime Options:**
- `edge` (default) - Edge Runtime
- `nodejs` - Node.js Runtime

---

### Workflows (Beta)

**What it is:** Automated CI/CD workflows that trigger based on deployments and events.

**What it's for:** Running tests after deployments, triggering webhooks, automating deployment processes.

**Documentation:** [Vercel Workflows Documentation](https://vercel.com/docs/git/vercel-for-github)

#### Implementation:

**GitHub Actions Workflow Triggered by Vercel Deployment:**

```yaml
name: End to End Tests

on:
  repository_dispatch:
    types:
      - 'vercel.deployment.success'

jobs:
  run-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: npm ci && npx playwright install --with-deps
      - name: Run E2E tests
        run: npx playwright test
        env:
          BASE_URL: ${{ github.event.client_payload.url }}
```

**Deployment Status Events:**

```yaml
on:
  repository_dispatch:
    - 'vercel.deployment.ready'
    - 'vercel.deployment.success'
    - 'vercel.deployment.error'
    - 'vercel.deployment.canceled'
    - 'vercel.deployment.pending'
```

**Deploy with Vercel CLI:**

```bash
# Set project ID and deploy
VERCEL_ORG_ID=team_123 VERCEL_PROJECT_ID=prj_456 vercel
```

---

### Runtime Cache

**What it is:** Distributed in-memory cache available across Vercel functions and middleware.

**What it's for:** Reducing external API calls, improving function performance, storing session data.

**Documentation:** [Vercel Runtime Cache Documentation](https://vercel.com/docs/functions/caching)

#### Implementation:

**Use Runtime Cache in TypeScript:**

```typescript
import { getCache } from '@vercel/functions';

export default async function handler(request: Request) {
  const cache = getCache();

  // Get value from cache
  const cachedData = await cache.get('blog-posts');

  if (cachedData) {
    return new Response(JSON.stringify(cachedData));
  }

  // Fetch from origin if not in cache
  const response = await fetch('https://api.vercel.app/blog');
  const data = await response.json();

  // Set in cache with TTL and tags
  await cache.set('blog-posts', data, {
    ttl: 3600, // 1 hour
    tags: ['blog', 'posts'],
  });

  return new Response(JSON.stringify(data));
}
```

**Cache Configuration:**
- `ttl`: Time to live in seconds
- `tags`: For cache invalidation
- `namespace`: Organize cache by feature

---

## CDN

### Edge Requests

**What it is:** Metrics and analytics for requests processed at Vercel's edge network.

**What it's for:** Understanding traffic patterns, identifying bottlenecks, monitoring edge performance.

**Documentation:** [Vercel Edge Network Documentation](https://vercel.com/docs/concepts/edge-network)

#### Implementation:

Query edge request metrics in Observability → Query:

```sql
-- Count total edge requests
VISUALIZE Edge Requests AS Count

-- Get requests per second
VISUALIZE Edge Requests AS Count per Second

-- Filter by specific host
WHERE host = 'my-site.com'

-- Get percentile latencies
VISUALIZE Duration AS 90th percentile
```

---

### Fast Data Transfer

**What it is:** Optimized data transfer between origin and edge, with caching strategies.

**What it's for:** Reducing bandwidth costs, improving content delivery speed.

**Documentation:** [Vercel Pricing & Networking](https://vercel.com/docs/pricing/networking)

#### Implementation:

Optimize data transfer by setting proper cache headers:

```typescript
// api/data.ts
export default async function handler(request: Request) {
  const data = await fetchData();

  return new Response(JSON.stringify(data), {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=3600',
      'CDN-Cache-Control': 'max-age=300',
    },
  });
}
```

---

### Image Optimization

**What it is:** Automatic image optimization for size, format, and responsive delivery.

**What it's for:** Reducing image file sizes, improving page performance.

**Documentation:** [Vercel Image Optimization](https://vercel.com/docs/image-optimization)

#### Implementation:

**Use Next.js Image Component (Recommended):**

```typescript
import Image from 'next/image';

export default function MyComponent() {
  return (
    <Image
      src="/my-image.jpg"
      alt="My Image"
      width={800}
      height={600}
      priority
      quality={85}
    />
  );
}
```

**Monitor Image Optimization Bandwidth:**

```sql
-- Query image optimization usage
request_path = '/_next/image' OR request_path = '/_vercel/image'
and host = 'my-site.com'
```

---

### ISR (Incremental Static Regeneration)

**What it is:** Technique for updating static content without full redeployment.

**What it's for:** Keeping static pages fresh, reducing build times.

**Documentation:** [Vercel ISR Documentation](https://vercel.com/docs/concepts/incremental-static-regeneration)

#### Implementation:

**Next.js App Router with ISR:**

```typescript
// app/blog/page.tsx
export const revalidate = 10; // Revalidate every 10 seconds

export default async function BlogPage() {
  const res = await fetch('https://api.vercel.app/blog', {
    next: { revalidate: 10 },
  });
  const posts = await res.json();

  return (
    <ul>
      {posts.map((post: any) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

**On-Demand ISR with Bypass Token:**

```typescript
// Trigger revalidation manually
const response = await fetch(
  'https://my-site.com/blog/my-post',
  {
    headers: {
      'x-prerender-revalidate': 'your-secret-bypass-token',
    },
  }
);
```

**Next.js Pages Router ISR:**

```typescript
export async function getStaticProps() {
  const res = await fetch('https://api.vercel.app/blog');
  const posts = await res.json();

  return {
    props: { posts },
    revalidate: 10, // Revalidate every 10 seconds
  };
}
```

---

### External Rewrites

**What it is:** Routing requests to external URLs while maintaining the original URL in the browser.

**What it's for:** Proxying content, integrating with legacy systems, masking API endpoints.

**Documentation:** [Vercel Rewrites Documentation](https://vercel.com/docs/rewrites)

#### Implementation:

**Basic Rewrite Configuration:**

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.example.com/:path*"
    }
  ]
}
```

**Wildcard Path Matching:**

```json
{
  "rewrites": [
    {
      "source": "/proxy/:match*",
      "destination": "https://example.com/:match*"
    }
  ]
}
```

---

### Microfrontends

**What it is:** Architecture pattern for splitting large UIs into smaller, independently deployed units.

**What it's for:** Enabling parallel development teams, independent deployment of UI modules.

**Documentation:** [Vercel Microfrontends Guide](https://vercel.com/docs)

#### Implementation:

Deploy multiple frontend applications on the same domain using routing:

```json
{
  "rewrites": [
    {
      "source": "/dashboard/:path*",
      "destination": "https://dashboard-app.vercel.app/:path*"
    },
    {
      "source": "/analytics/:path*",
      "destination": "https://analytics-app.vercel.app/:path*"
    }
  ]
}
```

---

## DEPLOYMENTS

### Build Diagnostics

**What it is:** Tools for analyzing build performance, identifying bottlenecks, and debugging build issues.

**What it's for:** Optimizing build times, troubleshooting failed deployments.

**Documentation:** [Vercel Build Output API](https://vercel.com/docs/build-output-api)

#### Implementation:

1. Navigate to Deployments → Select a Deployment
2. Click "Deployment Details"
3. View:
   - Build duration
   - Asset sizes
   - Function initialization times
   - Error logs and warnings
   - Build output analysis

**Optimize Build Performance:**

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "next build",
  "outputDirectory": ".next"
}
```

---

## SERVICES

### AI

**What it is:** Integration with AI models (GPT, Claude, Gemini, etc.) via Vercel's AI Gateway.

**What it's for:** Building AI-powered features, chat applications, content generation.

**Documentation:** [Vercel AI SDK Documentation](https://vercel.com/docs/ai-sdk)

#### Implementation:

**Install AI SDK:**

```bash
npm install ai
# Also install a provider:
npm install @ai-sdk/openai
# or
npm install @ai-sdk/anthropic
```

**Generate Text with AI SDK:**

```typescript
// api/chat.ts
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(request: Request) {
  const { prompt } = await request.json();

  const { text } = await generateText({
    model: openai('gpt-4-turbo'),
    prompt,
  });

  return Response.json({ text });
}
```

**Use with Tool Calling:**

```typescript
import { generateText, tool } from 'ai';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';

export async function POST(request: Request) {
  const { prompt } = await request.json();

  const { text } = await generateText({
    model: openai('gpt-4-turbo'),
    prompt,
    tools: {
      getWeather: tool({
        description: 'Get weather for a location',
        inputSchema: z.object({
          location: z.string(),
        }),
        execute: async ({ location }) => ({
          location,
          temperature: 72,
        }),
      }),
    },
  });

  return Response.json({ text });
}
```

**Supported Providers:**
- OpenAI (GPT-4, GPT-5)
- Anthropic (Claude)
- Google (Gemini)
- XAI (Grok)
- And more via AI Gateway

---

### Blob Storage

**What it is:** Managed file storage for images, documents, and other media.

**What it's for:** Uploading and serving user-generated content, storing assets.

**Documentation:** [Vercel Blob Storage Documentation](https://vercel.com/docs/storage/vercel-blob)

#### Implementation:

**Server-Side Upload:**

```typescript
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  const file = request.formData();

  const blob = await put('my-file.txt', file, {
    access: 'public',
  });

  return Response.json(blob);
}
```

**Client-Side Upload:**

```typescript
// pages/api/upload.ts
import { handleUpload } from '@vercel/blob/client';

export default async function handler(request: Request) {
  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Upload completed:', blob);
      },
    });

    return Response.json(jsonResponse);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
```

**Frontend Upload Component:**

```typescript
import { upload } from '@vercel/blob/client';

export default function UploadComponent() {
  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = (e.target as HTMLFormElement).file.files?.[0];

    if (!file) return;

    const newBlob = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: '/api/upload',
    });

    console.log('Uploaded to:', newBlob.url);
  }

  return (
    <form onSubmit={handleUpload}>
      <input name="file" type="file" required />
      <button type="submit">Upload</button>
    </form>
  );
}
```

**Configure Cache Duration:**

```typescript
const blob = await put('my-file.txt', fileContent, {
  access: 'public',
  cacheControlMaxAge: 3600, // Cache for 1 hour
});
```

---

## Quick Start Checklist

- [ ] Set up Speed Insights for performance monitoring
- [ ] Create monitoring queries in Observability
- [ ] Deploy your first serverless function
- [ ] Configure middleware for security headers
- [ ] Set up ISR for static content
- [ ] Enable image optimization
- [ ] Integrate AI features with AI SDK
- [ ] Configure Blob storage for media
- [ ] Set up build diagnostics monitoring
- [ ] Create alerts for critical metrics

---

## Useful Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Rest API Reference](https://vercel.com/docs/rest-api)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Next.js Framework Guides](https://nextjs.org/docs)
- [AI SDK Guide](https://sdk.vercel.ai)

---

**Last Updated:** February 2026
