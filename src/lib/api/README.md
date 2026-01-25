# OpenAPI React Query Setup

This project uses `openapi-react-query` for type-safe API calls with automatic Supabase authentication.

## Setup

1. **Generate OpenAPI Types**

   First, generate TypeScript types from your OpenAPI schema:

   ```bash
   npx openapi-typescript <path-to-openapi-schema> -o ./src/lib/api/types.ts
   ```

   Examples:
   - From a URL: `npx openapi-typescript https://api.example.com/openapi.json -o ./src/lib/api/types.ts`
   - From a local file: `npx openapi-typescript ./openapi.yaml -o ./src/lib/api/types.ts`

2. **Configure API Base URL**

   Add your API base URL to your `.env` file:

   ```env
   VITE_API_BASE_URL=https://api.example.com
   ```

## Usage

The API client automatically adds the Supabase authorization header to all requests.

### Basic Query Example

```tsx
import { $api } from '@/lib/api-client'

function UserProfile() {
  const { data, error, isLoading } = $api.useQuery(
    'get',
    '/users/me',
    {}
  )

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <div>Hello, {data?.name}!</div>
}
```

### Query with Parameters

```tsx
import { $api } from '@/lib/api-client'

function PostDetails({ postId }: { postId: number }) {
  const { data, error, isLoading } = $api.useQuery(
    'get',
    '/posts/{post_id}',
    {
      params: {
        path: { post_id: postId },
      },
    }
  )

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <article>{data?.title}</article>
}
```

### Mutation Example

```tsx
import { $api } from '@/lib/api-client'

function CreatePost() {
  const { mutate, isPending } = $api.useMutation('post', '/posts')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    mutate({
      body: {
        title: 'My Post',
        content: 'Post content...',
      },
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  )
}
```

## Features

- ✅ **Type-safe**: All API calls are fully typed based on your OpenAPI schema
- ✅ **Auto-authentication**: Automatically adds Supabase Bearer token to all requests
- ✅ **React Query integration**: Built on top of TanStack React Query
- ✅ **No manual typing**: Types are generated from your OpenAPI schema

## Documentation

- [openapi-react-query docs](https://openapi-ts.dev/openapi-react-query/)
- [openapi-fetch docs](https://openapi-ts.dev/openapi-fetch/)
- [TanStack React Query docs](https://tanstack.com/query/latest)
