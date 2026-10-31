import { NextRequest, NextResponse } from 'next/server';
import { fetchProjects, ProjectsFetchError } from '@/src/lib/projects';
import { PAGE_SIZE } from '@/src/lib/pagination';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const limit = Math.min(Math.max(Number(sp.get('limit')) || PAGE_SIZE, 1), 50);
  const offset = Math.max(Number(sp.get('offset')) || 0, 0);
  const authorization = req.headers.get('authorization');
  const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

  try {
    const data = await fetchProjects({ limit, offset, accessToken });
    return NextResponse.json(data); // { projects, totalCount }
  } catch (err) {
    const status = err instanceof ProjectsFetchError ? err.status : 500;
    return NextResponse.json(
      { error: 'Failed to load projects' },
      { status }
    );
  }
}