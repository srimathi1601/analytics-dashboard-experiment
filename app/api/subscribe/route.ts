import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB = path.join(process.cwd(), 'data', 'subscribers.json');

function readAll(): Subscriber[] {
  try {
    return JSON.parse(fs.readFileSync(DB, 'utf8'));
  } catch {
    return [];
  }
}

function writeAll(list: Subscriber[]) {
  fs.writeFileSync(DB, JSON.stringify(list, null, 2), 'utf8');
}

interface Subscriber {
  email: string;
  source: string;
  subscribedAt: string;
  status: 'active';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body.email ?? '').trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const list = readAll();

    if (list.some((s) => s.email === email)) {
      return NextResponse.json({ message: 'Already subscribed' }, { status: 200 });
    }

    const entry: Subscriber = {
      email,
      source: body.source ?? 'Newsletter Form',
      subscribedAt: new Date().toISOString(),
      status: 'active',
    };

    list.push(entry);
    writeAll(list);

    return NextResponse.json({ message: 'Subscribed successfully', email }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/subscribe]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// CORS preflight — needed if sportstech.io calls this from a different domain
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
