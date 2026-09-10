import { NextResponse } from 'next/server';

export function apiError(message: string, status: number = 400, details?: any) {
    return NextResponse.json(
        { error: message, details },
        { status }
    );
}
