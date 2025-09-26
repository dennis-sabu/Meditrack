'use server';
import { cookies } from "next/headers";
type BooleanCookies = "iscompletedProfile" | "isDarkMode" | "isFirstVisit";
type StringCookies = "userId" | "access" | "refresh" | "csrfToken" | "appVersion" | "theme" | "locale" | "currency" | "lastLogin";
export async function setStringCookie(Key: StringCookies, value: string) {
    const c = await cookies();
    c.set(Key, value, {
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
    });
}
export async function setBoolCookie(Key: BooleanCookies, value: boolean) {
    const c = await cookies()
    c.set(Key, value ? 'Y' : "N", {
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
    });
}
export async function getStringCookie(Key: StringCookies) {
    const cookieStore = await cookies();
    return cookieStore.get(Key)?.value ?? null;
}
export async function getBoolCookie(Key: BooleanCookies) {
    const cookieStore = await cookies();
    const s = cookieStore.get(Key)?.value ?? null;
    if (s === 'Y') {
        return true;
    } else {
        return false;
    }
}
